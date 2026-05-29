import { prisma } from "@/lib/db";
import { checkStoreStock } from "@/lib/scrapers";
import { bootstrapDatabase } from "@/lib/seed";
import { sendStockAlerts } from "@/lib/notifications";
import { getStoreDisplayMeta } from "@/lib/store-display";

const REVIEW_CHECK_COUNT = 5;

export async function runStockCheckCycle() {
  await bootstrapDatabase();

  const stores = await prisma.monitorStore.findMany({
    where: { enabled: true },
    orderBy: { name: "asc" },
  });

  const newHits: string[] = [];

  for (const store of stores) {
    let result;

    try {
      result = await checkStoreStock({
        slug: store.slug,
        url: store.url,
      });
    } catch (error) {
      console.error(`Stock check failed for ${store.slug}`, error);
      result = {
        status: "ERROR" as const,
        detail: error instanceof Error ? error.message : "Unexpected scraper error",
      };
    }

    await prisma.stockCheck.create({
      data: {
        storeId: store.id,
        status: result.status,
        detail: result.detail,
      },
    });

    if (result.status !== "IN_STOCK") continue;

    const recentHit = await prisma.hit.findFirst({
      where: {
        storeId: store.id,
        resolvedAt: null,
        detectedAt: { gte: new Date(Date.now() - 6 * 60 * 60 * 1000) },
      },
    });

    if (recentHit) continue;

    const hit = await prisma.hit.create({
      data: {
        storeId: store.id,
        productName: store.productName,
      },
    });

    newHits.push(hit.id);
  }

  if (newHits.length > 0) {
    await sendStockAlerts(newHits);
  }

  return { checked: stores.length, newHits: newHits.length };
}

export async function getDashboardData() {
  await bootstrapDatabase();

  const stores = await prisma.monitorStore.findMany({
    where: { enabled: true },
    orderBy: { name: "asc" },
  });

  const sortedStores = [...stores].sort((a, b) => {
    const aMeta = getStoreDisplayMeta(a.slug, a.region);
    const bMeta = getStoreDisplayMeta(b.slug, b.region);

    return (
      aMeta.groupRank - bMeta.groupRank ||
      aMeta.storeRank - bMeta.storeRank ||
      a.name.localeCompare(b.name)
    );
  });

  const checkSummaries = await Promise.all(
    sortedStores.map((store) =>
      prisma.stockCheck.findMany({
        where: { storeId: store.id },
        orderBy: { checkedAt: "desc" },
        take: REVIEW_CHECK_COUNT,
      }),
    ),
  );

  const checkByStore = new Map(
    sortedStores
      .map((store, i) => [store.id, checkSummaries[i][0]] as const)
      .filter(([, latestCheck]) => latestCheck != null),
  );

  const reviewNoteByStore = new Map(
    sortedStores
      .map((store, i) => {
        const reviewNote = getStoreReviewNote(checkSummaries[i]);
        return reviewNote ? ([store.id, reviewNote] as const) : null;
      })
      .filter((entry) => entry != null),
  );

  const activeHits = await prisma.hit.findMany({
    where: { resolvedAt: null },
    include: {
      store: true,
      outcomes: { include: { user: true } },
    },
    orderBy: { detectedAt: "desc" },
    take: 20,
  });

  const anyInStock = sortedStores.some(
    (s) => checkByStore.get(s.id)?.status === "IN_STOCK",
  );

  return {
    stores: sortedStores.map((store) => {
      const displayMeta = getStoreDisplayMeta(store.slug, store.region);

      return {
        ...store,
        displayMeta,
        latestCheck: checkByStore.get(store.id) ?? null,
        reviewNote: reviewNoteByStore.get(store.id) ?? null,
      };
    }),
    activeHits,
    anyInStock,
  };
}

function getStoreReviewNote(
  checks: Array<{
    status: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN" | "ERROR";
    detail: string | null;
  }>,
): string | null {
  if (checks.length < REVIEW_CHECK_COUNT) return null;

  const unclearChecks = checks.filter(
    (check) => check.status === "UNKNOWN" || check.status === "ERROR",
  );

  if (unclearChecks.length < REVIEW_CHECK_COUNT) return null;

  const blockedCount = unclearChecks.filter((check) =>
    check.detail?.toLowerCase().includes("block"),
  ).length;

  if (blockedCount >= 3) {
    return "This source has been blocked or unclear for the last several checks. Keep it for now, but review before trusting it.";
  }

  return "This source has been unclear for the last several checks. It may still become useful if the site exposes stock later.";
}

export async function getWeeklyHitSummary() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const hits = await prisma.hit.findMany({
    where: { detectedAt: { gte: weekAgo } },
    include: {
      store: true,
      outcomes: { include: { user: true } },
    },
    orderBy: { detectedAt: "desc" },
  });

  return hits;
}
