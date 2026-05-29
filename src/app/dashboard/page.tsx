import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { DashboardShell } from "@/components/DashboardShell";
import { getSessionUser, isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStoreDisplayMeta } from "@/lib/store-display";
import { getDashboardData } from "@/lib/stock-service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login");
  }

  const isAdmin = await isAdminAuthenticated();
  const { stores, activeHits } = await getDashboardData();

  const recentHits = await prisma.hit.findMany({
    include: { store: true, outcomes: { include: { user: true } } },
    orderBy: { detectedAt: "desc" },
    take: 10,
  });

  const activeHitByStore = new Map(
    activeHits.map((hit) => [hit.storeId, hit.id] as const),
  );

  const dashboardStores = stores.map((store) => ({
    id: store.id,
    slug: store.slug,
    name: store.name,
    productName: store.productName,
    region: store.region,
    url: store.url,
    groupLabel: store.displayMeta.groupLabel,
    locationLabel: store.displayMeta.locationLabel,
    note: store.displayMeta.note,
    reviewNote: store.reviewNote,
    status: store.latestCheck?.status ?? ("UNKNOWN" as const),
    detail: store.latestCheck?.detail ?? null,
    checkedAt: store.latestCheck?.checkedAt?.toISOString() ?? null,
    activeHitId: activeHitByStore.get(store.id),
  }));

  const serializedHits = recentHits.map((hit) => ({
    id: hit.id,
    detectedAt: hit.detectedAt.toISOString(),
    productName: hit.productName,
    storeName: hit.store.name,
    locationLabel: getStoreDisplayMeta(hit.store.slug, hit.store.region)
      .locationLabel,
    outcomeNames: hit.outcomes.map((o) => o.user.fullName).join(", "),
  }));

  return (
    <>
      <AppHeader isAdmin={isAdmin} sessionUser={sessionUser} />
      <DashboardShell
        stores={dashboardStores}
        recentHits={serializedHits}
        currentUserName={sessionUser.fullName}
        isAdmin={isAdmin}
      />
    </>
  );
}
