import type { StockStatus } from "@prisma/client";
import { fetchPage } from "./fetch-page";
import {
  availabilityFromHtmlPatterns,
  availabilityFromJsonLd,
  checkSearchPageForBlantons,
  pageShowsBuyable,
  pageShowsSoldOut,
  reconcileStockResult,
  type CheckResult,
} from "./parse";

export type ScrapeInput = {
  slug: string;
  url: string;
};

export async function checkStoreStock(input: ScrapeInput): Promise<CheckResult> {
  const fetched = await fetchPage(input.url);
  if (!fetched.ok) {
    if (fetched.status === 403) {
      return {
        status: "UNKNOWN",
        detail:
          "Site blocks automated checks after retries — open store link to verify",
      };
    }

    if (fetched.status && fetched.status >= 500) {
      return {
        status: "UNKNOWN",
        detail:
          "Store page could not be reached after retries — open store link to verify",
      };
    }

    return {
      status: "ERROR",
      detail: fetched.error,
    };
  }

  const { html } = fetched;

  if (input.slug.startsWith("lcbo-") && input.slug.endsWith("store-inventory")) {
    const lower = html.toLowerCase();
    const totalUnits = html.match(/Total Units Available At\s+(\d+)\s+Stores?:\s+(\d+)/i);

    if (totalUnits) {
      const [, storeCount, unitCount] = totalUnits;
      const mentionsKingston =
        lower.includes("queen mary & bath") ||
        lower.includes("barrack & king") ||
        lower.includes("division & john counter") ||
        lower.includes("kingston");

      return {
        status: "IN_STOCK",
        detail: mentionsKingston
          ? `LCBO inventory lists ${unitCount} units across ${storeCount} stores, including Kingston-area text`
          : `LCBO inventory lists ${unitCount} units across ${storeCount} Ontario stores`,
      };
    }

    return {
      status: "UNKNOWN",
      detail:
        "No LCBO inventory rows exposed right now — open link to check Kingston/Ontario stores",
    };
  }

  if (input.slug === "wow-special-reserve") {
    const text = html.replace(/\s+/g, " ").toLowerCase();
    if (text.includes("in stock")) {
      return {
        status: "IN_STOCK",
        detail:
          "Page says in stock, but also says online orders may be refunded — call store first",
      };
    }

    if (pageShowsSoldOut(html)) {
      return {
        status: "OUT_OF_STOCK",
        detail: "Page shows sold out",
      };
    }

    return {
      status: "UNKNOWN",
      detail: "Product page found, but store stock state is unclear",
    };
  }

  if (input.slug === "liquor-lane" || input.slug === "wow-liquor") {
    if (pageShowsSoldOut(html)) {
      return {
        status: "OUT_OF_STOCK",
        detail: "Page shows sold out",
      };
    }

    if (pageShowsBuyable(html)) {
      return {
        status: "IN_STOCK",
        detail: "Active product page with add-to-cart signal",
      };
    }

    return {
      status: "UNKNOWN",
      detail: "Product page found, but buy button/stock state is unclear",
    };
  }

  if (
    input.slug === "craft-cellars" ||
    input.slug === "kingsway-liquor" ||
    input.slug === "south-park-liquor" ||
    input.slug === "canadian-liquor-store"
  ) {
    const text = html.replace(/\s+/g, " ").toLowerCase();

    if (input.slug === "craft-cellars" && text.includes("add to cart")) {
      return {
        status: "IN_STOCK",
        detail: "Product page shows add to cart",
      };
    }

    if (
      input.slug === "kingsway-liquor" &&
      (/\b\d+\s+in stock\b/i.test(text) || text.includes("in stock")) &&
      text.includes("add to cart")
    ) {
      return {
        status: "IN_STOCK",
        detail: "Product page shows in stock and add to cart",
      };
    }

    if (pageShowsSoldOut(html)) {
      return {
        status: "OUT_OF_STOCK",
        detail: "Page shows sold out",
      };
    }

    if (pageShowsBuyable(html)) {
      return {
        status: "IN_STOCK",
        detail: "Product page shows add-to-cart signal",
      };
    }
  }

  const jsonLd = availabilityFromJsonLd(html);
  if (jsonLd && jsonLd.status !== "UNKNOWN") {
    return reconcileStockResult(html, jsonLd);
  }

  if (input.slug === "nslc-search" || input.slug === "mlcc-search") {
    return checkSearchPageForBlantons(html);
  }

  if (input.slug === "bcl-original") {
    const lower = html.toLowerCase();
    if (lower.includes("out of stock")) {
      return { status: "OUT_OF_STOCK", detail: "Page shows Out of Stock" };
    }
    if (lower.includes("in stock") || lower.includes("add to cart")) {
      return { status: "IN_STOCK", detail: "Page suggests in stock" };
    }
  }

  const patterns = availabilityFromHtmlPatterns(html);
  if (patterns.status !== "UNKNOWN") {
    return reconcileStockResult(html, patterns);
  }

  return jsonLd ? reconcileStockResult(html, jsonLd) : patterns;
}

export async function checkAllStores(
  stores: ScrapeInput[],
): Promise<Array<ScrapeInput & CheckResult & { checkedAt: Date }>> {
  const results = await Promise.all(
    stores.map(async (store) => {
      const result = await checkStoreStock(store);
      return {
        ...store,
        ...result,
        checkedAt: new Date(),
      };
    }),
  );
  return results;
}

export function statusLabel(status: StockStatus): string {
  switch (status) {
    case "IN_STOCK":
      return "In stock";
    case "OUT_OF_STOCK":
      return "Out of stock";
    case "ERROR":
      return "Check failed";
    default:
      return "Unknown";
  }
}
