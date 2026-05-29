import type { StockStatus } from "@prisma/client";

export type CheckResult = {
  status: StockStatus;
  detail: string;
};

export function availabilityFromJsonLd(html: string): CheckResult | null {
  const blocks = html.match(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  if (!blocks) return null;

  for (const block of blocks) {
    const raw = block.replace(/<\/?script[^>]*>/gi, "").trim();
    try {
      const data = JSON.parse(raw) as Record<string, unknown>;
      const found = findAvailability(data);
      if (found) return found;
    } catch {
      // try next block
    }
  }
  return null;
}

function findAvailability(node: unknown): CheckResult | null {
  if (!node || typeof node !== "object") return null;

  if (Array.isArray(node)) {
    for (const item of node) {
      const hit = findAvailability(item);
      if (hit) return hit;
    }
    return null;
  }

  const obj = node as Record<string, unknown>;

  if (obj["@graph"] && Array.isArray(obj["@graph"])) {
    for (const item of obj["@graph"]) {
      const hit = findAvailability(item);
      if (hit) return hit;
    }
  }

  const offers = obj.offers;
  if (offers) {
    const offerList = Array.isArray(offers) ? offers : [offers];
    for (const offer of offerList) {
      if (offer && typeof offer === "object") {
        const availability = (offer as Record<string, unknown>).availability;
        const parsed = parseAvailabilityUrl(String(availability ?? ""));
        if (parsed) return parsed;
      }
    }
  }

  if (obj.availability) {
    const parsed = parseAvailabilityUrl(String(obj.availability));
    if (parsed) return parsed;
  }

  return null;
}

function parseAvailabilityUrl(value: string): CheckResult | null {
  const v = value.toLowerCase();
  if (!v) return null;
  if (v.includes("instock") || v.includes("in_stock")) {
    return { status: "IN_STOCK", detail: "Schema.org: InStock" };
  }
  if (v.includes("outofstock") || v.includes("out_of_stock")) {
    return { status: "OUT_OF_STOCK", detail: "Schema.org: OutOfStock" };
  }
  if (v.includes("discontinued") || v.includes("soldout")) {
    return { status: "OUT_OF_STOCK", detail: "Schema.org: unavailable" };
  }
  return null;
}

/** Visible page signals that override misleading Schema.org metadata. */
export function pageShowsSoldOut(html: string): boolean {
  const text = html.replace(/\s+/g, " ").toLowerCase();

  const soldOutPhrases = [
    "sold out",
    "out of stock",
    "currently unavailable",
    "not available online",
    "notify me when available",
    "email when available",
  ];

  if (soldOutPhrases.some((p) => text.includes(p))) return true;
  if (/"available"\s*:\s*false/i.test(html)) return true;
  if (/variant-sold-out|product-unavailable|sold-out/i.test(html)) return true;
  if (/add to cart[^<]{0,300}(disabled|aria-disabled)/i.test(html)) return true;

  return false;
}

export function pageShowsBuyable(html: string): boolean {
  const text = html.replace(/\s+/g, " ").toLowerCase();
  if (pageShowsSoldOut(html)) return false;

  const hasActiveCartButton =
    /class=["'][^"']*single_add_to_cart_button[^"']*["'][^>]*>\s*add to cart/i.test(
      html,
    ) ||
    /<button[^>]*(name=["']add-to-cart["']|type=["']submit["'])[^>]*>\s*add to cart/i.test(
      html,
    ) ||
    text.includes("add to bag") ||
    text.includes("buy now");

  if (!hasActiveCartButton) return false;

  const hasInStockSignal =
    /<p[^>]*class=["'][^"']*stock\s+in-stock[^"']*["'][^>]*>/i.test(html) ||
    /inventory_status[\s\S]{0,200}in stock/i.test(html) ||
    /\b\d+\s+in stock\b/i.test(text) ||
    /"availability"\s*:\s*"https?:\/\/schema\.org\/InStock"/i.test(html) ||
    /"availability"\s*:\s*"InStock"/i.test(html);

  return hasInStockSignal;
}

export function reconcileStockResult(
  html: string,
  result: CheckResult,
): CheckResult {
  if (result.status !== "IN_STOCK") return result;

  if (pageShowsSoldOut(html)) {
    return {
      status: "OUT_OF_STOCK",
      detail: "Page shows sold out (website metadata was misleading)",
    };
  }

  if (
    result.detail?.includes("Schema") &&
    !pageShowsBuyable(html)
  ) {
    return {
      status: "UNKNOWN",
      detail:
        "Metadata says in stock, but no active buy button found — verify on site",
    };
  }

  return result;
}

export function availabilityFromHtmlPatterns(html: string): CheckResult {
  const text = html.replace(/\s+/g, " ").toLowerCase();

  const inStockStrong = [
    "add to cart",
    "add to bag",
    "buy now",
    "available online",
  ];
  const outStockStrong = [
    "out of stock",
    "sold out",
    "currently unavailable",
    "not available",
    "no longer available",
  ];

  const inHits = inStockStrong.filter((p) => text.includes(p));
  const outHits = outStockStrong.filter((p) => text.includes(p));

  if (inHits.length && !outHits.length) {
    return { status: "IN_STOCK", detail: `Phrases: ${inHits.join(", ")}` };
  }
  if (outHits.length && !inHits.length) {
    return { status: "OUT_OF_STOCK", detail: `Phrases: ${outHits.join(", ")}` };
  }
  if (inHits.length && outHits.length) {
    if (text.includes("out of stock") && text.includes("add to cart")) {
      return {
        status: "UNKNOWN",
        detail: "Mixed signals on page — verify manually",
      };
    }
  }
  if (outHits.length) {
    return { status: "OUT_OF_STOCK", detail: `Phrases: ${outHits.join(", ")}` };
  }
  if (inHits.length) {
    return { status: "IN_STOCK", detail: `Phrases: ${inHits.join(", ")}` };
  }

  return { status: "UNKNOWN", detail: "Could not determine stock from page" };
}

export function checkSearchPageForBlantons(html: string): CheckResult {
  const text = html.toLowerCase();
  if (!text.includes("blanton")) {
    return { status: "UNKNOWN", detail: "Blanton's not found on search page" };
  }

  const hasInStock =
    text.includes("in stock") ||
    text.includes("add to cart") ||
    text.includes("available");

  const hasOut =
    text.includes("out of stock") ||
    text.includes("sold out") ||
    text.includes("unavailable");

  if (hasInStock && !hasOut) {
    return { status: "IN_STOCK", detail: "Search page suggests availability" };
  }
  if (hasOut && !hasInStock) {
    return { status: "OUT_OF_STOCK", detail: "Search page suggests sold out" };
  }

  return {
    status: "UNKNOWN",
    detail: "Blanton's found but stock unclear — open link",
  };
}
