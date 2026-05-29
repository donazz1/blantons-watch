"use client";

import { useMemo, useState } from "react";
import { BlantonHero, type FoundStoreSummary } from "./BlantonHero";
import {
  DashboardFilterChips,
  type DashboardFilter,
} from "./DashboardFilterChips";
import { MobileBottomBar } from "./MobileBottomBar";
import { StoreCard } from "./StoreCard";
import type { StockStatus } from "@prisma/client";

export type DashboardStoreItem = {
  id: string;
  slug: string;
  name: string;
  productName: string;
  region: string;
  url: string;
  groupLabel: string;
  locationLabel: string;
  note?: string;
  reviewNote?: string | null;
  status: StockStatus;
  detail?: string | null;
  checkedAt: string | null;
  activeHitId?: string;
};

type RecentHit = {
  id: string;
  detectedAt: string;
  productName: string;
  storeName: string;
  locationLabel: string;
  outcomeNames: string;
};

type Props = {
  stores: DashboardStoreItem[];
  recentHits: RecentHit[];
  currentUserName: string;
  isAdmin: boolean;
};

function matchesFilter(store: DashboardStoreItem, filter: DashboardFilter): boolean {
  switch (filter) {
    case "found":
      return store.status === "IN_STOCK";
    case "ontario":
      return (
        store.region.toLowerCase().includes("ontario") ||
        store.locationLabel.toLowerCase().includes("kingston") ||
        store.groupLabel.toLowerCase().includes("ontario") ||
        store.locationLabel.toLowerCase().includes("ontario")
      );
    case "adjacent":
      return store.groupLabel.includes("Adjacent");
    case "review":
      return Boolean(store.reviewNote);
    default:
      return true;
  }
}

export function DashboardShell({
  stores,
  recentHits,
  currentUserName,
  isAdmin,
}: Props) {
  const [filter, setFilter] = useState<DashboardFilter>("all");

  const foundStores: FoundStoreSummary[] = useMemo(
    () =>
      stores
        .filter((s) => s.status === "IN_STOCK")
        .map((s) => ({
          id: s.id,
          name: s.name,
          productName: s.productName,
          locationLabel: s.locationLabel,
          url: s.url,
        })),
    [stores],
  );

  const anyInStock = foundStores.length > 0;

  const filteredStores = useMemo(
    () => stores.filter((s) => matchesFilter(s, filter)),
    [stores, filter],
  );

  const grouped = useMemo(() => {
    const groups: { label: string; stores: DashboardStoreItem[] }[] = [];
    for (const store of filteredStores) {
      const existing = groups.find((g) => g.label === store.groupLabel);
      if (existing) existing.stores.push(store);
      else groups.push({ label: store.groupLabel, stores: [store] });
    }
    return groups;
  }, [filteredStores]);

  const filterCounts = useMemo(() => {
    const count = (f: DashboardFilter) =>
      stores.filter((s) => matchesFilter(s, f)).length;
    return {
      all: stores.length,
      found: count("found"),
      ontario: count("ontario"),
      adjacent: count("adjacent"),
      review: count("review"),
    };
  }, [stores]);

  return (
    <>
      <main className="app-main mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-4">
        <BlantonHero
          anyInStock={anyInStock}
          foundStores={foundStores}
          foundCount={foundStores.length}
          storeCount={stores.length}
        />

        <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300">
          Signed in as{" "}
          <span className="font-bold text-amber-100">{currentUserName}</span>
        </p>

        <div className="mt-5">
          <DashboardFilterChips
            active={filter}
            onChange={setFilter}
            counts={filterCounts}
          />
        </div>

        <section id="store-status" className="mt-6">
          <h2 className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-amber-300">
            Sources
          </h2>

          {grouped.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-slate-400">
              No stores match this filter.
            </p>
          ) : (
            <div className="space-y-4">
              {grouped.map((group) => {
                const groupFound = group.stores.filter(
                  (s) => s.status === "IN_STOCK",
                ).length;
                const groupReview = group.stores.filter((s) => s.reviewNote).length;

                return (
                  <details
                    key={group.label}
                    open={groupFound > 0 || filter !== "all"}
                    className="group rounded-2xl border border-white/10 bg-white/[0.03] p-2"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-2 py-2 [&::-webkit-details-marker]:hidden">
                      <span>
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-cyan-300/90">
                          {group.label}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {group.stores.length} source
                          {group.stores.length === 1 ? "" : "s"}
                          {groupReview > 0 ? ` · ${groupReview} review` : ""}
                        </span>
                      </span>
                      <span className="flex items-center gap-2">
                        {groupFound > 0 ? (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-100">
                            {groupFound} found
                          </span>
                        ) : null}
                        <span className="text-slate-500 transition group-open:rotate-180">
                          ▼
                        </span>
                      </span>
                    </summary>
                    <div className="mt-1 space-y-2 px-1 pb-1">
                      {group.stores.map((store) => (
                        <StoreCard
                          key={store.id}
                          name={store.name}
                          productName={store.productName}
                          region={store.region}
                          locationLabel={store.locationLabel}
                          url={store.url}
                          status={store.status}
                          detail={store.detail}
                          checkedAt={
                            store.checkedAt ? new Date(store.checkedAt) : null
                          }
                          note={store.note}
                          reviewNote={store.reviewNote}
                          activeHitId={store.activeHitId}
                          defaultExpanded={store.status === "IN_STOCK"}
                        />
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-amber-300">
            Recent hits
          </h2>
          {recentHits.length === 0 ? (
            <p className="text-sm text-slate-500">No hits recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentHits.map((hit) => (
                <li
                  key={hit.id}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300"
                >
                  <span className="font-semibold text-slate-100">
                    {hit.productName}
                  </span>
                  <span className="text-slate-400"> @ {hit.storeName}</span>
                  <br />
                  <span className="text-slate-500">
                    {new Date(hit.detectedAt).toLocaleString("en-CA")} ·{" "}
                    {hit.locationLabel}
                    {hit.outcomeNames ? ` · ${hit.outcomeNames}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mt-8 text-center text-[11px] text-slate-600">
          Safari → Share → Add to Home Screen
        </p>
      </main>

      <MobileBottomBar
        isAdmin={isAdmin}
        activeFilter={filter}
        onFilterChange={setFilter}
        foundCount={foundStores.length}
      />
    </>
  );
}
