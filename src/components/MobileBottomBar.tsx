"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FilterId = "all" | "found" | "ontario" | "adjacent" | "review";

type Props = {
  isAdmin: boolean;
  activeFilter: FilterId;
  onFilterChange: (filter: FilterId) => void;
  foundCount: number;
};

export function MobileBottomBar({
  isAdmin,
  activeFilter,
  onFilterChange,
  foundCount,
}: Props) {
  const router = useRouter();
  const [scraping, setScraping] = useState(false);

  async function runScrape() {
    setScraping(true);
    try {
      const res = await fetch("/api/scrape", { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setScraping(false);
    }
  }

  function scrollToStatus() {
    onFilterChange("all");
    document.getElementById("store-status")?.scrollIntoView({ behavior: "smooth" });
  }

  function showFound() {
    onFilterChange("found");
    document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <nav
      className="mobile-bottom-bar fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-slate-950/95 px-2 pt-2 backdrop-blur-xl"
      aria-label="Main actions"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={scrollToStatus}
          className={`flex min-h-12 min-w-[4.5rem] flex-1 flex-col items-center justify-center rounded-2xl px-2 text-[10px] font-bold ${
            activeFilter === "all"
              ? "bg-white/10 text-amber-200"
              : "text-slate-400"
          }`}
        >
          <span className="text-base" aria-hidden>
            ≡
          </span>
          Status
        </button>

        <button
          type="button"
          onClick={showFound}
          className={`relative flex min-h-12 min-w-[4.5rem] flex-1 flex-col items-center justify-center rounded-2xl px-2 text-[10px] font-bold ${
            activeFilter === "found"
              ? "bg-emerald-500/20 text-emerald-100"
              : "text-slate-400"
          }`}
        >
          {foundCount > 0 ? (
            <span className="absolute right-3 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-black text-slate-950">
              {foundCount}
            </span>
          ) : null}
          <span className="text-base" aria-hidden>
            ★
          </span>
          Found
        </button>

        <button
          type="button"
          onClick={runScrape}
          disabled={scraping}
          className="flex min-h-12 min-w-[4.5rem] flex-1 flex-col items-center justify-center rounded-2xl px-2 text-[10px] font-bold text-amber-200 disabled:opacity-50"
        >
          <span className="text-base" aria-hidden>
            ↻
          </span>
          {scraping ? "…" : "Check"}
        </button>

        {isAdmin ? (
            <Link
              href="/admin"
              className="flex min-h-12 min-w-[4.5rem] flex-1 flex-col items-center justify-center rounded-2xl px-2 text-[10px] font-bold text-slate-400"
            >
              <span className="text-base" aria-hidden>
                ⚙
              </span>
              Admin
            </Link>
        ) : null}
      </div>
    </nav>
  );
}
