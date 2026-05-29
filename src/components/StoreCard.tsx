"use client";

import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { HitOutcomeButtons } from "./HitOutcomeButtons";
import type { StockStatus } from "@prisma/client";

type Props = {
  name: string;
  productName: string;
  region: string;
  locationLabel: string;
  url: string;
  status: StockStatus;
  detail?: string | null;
  checkedAt?: Date | null;
  note?: string;
  reviewNote?: string | null;
  activeHitId?: string;
  defaultExpanded?: boolean;
};

export function StoreCard({
  name,
  productName,
  region,
  locationLabel,
  url,
  status,
  detail,
  checkedAt,
  note,
  reviewNote,
  activeHitId,
  defaultExpanded = false,
}: Props) {
  const inStock = status === "IN_STOCK";
  const [expanded, setExpanded] = useState(defaultExpanded || inStock);

  const checkedLabel = checkedAt
    ? checkedAt.toLocaleString("en-CA", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Not checked yet";

  return (
    <article
      className={`store-card overflow-hidden rounded-2xl border transition ${
        inStock
          ? "border-emerald-400/50 bg-gradient-to-r from-emerald-500/15 to-slate-900/90 ring-1 ring-emerald-400/25"
          : "border-white/10 bg-slate-900/70"
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-3 py-3 text-left active:bg-white/5"
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-black text-white">{name}</h3>
            <StatusBadge status={status} compact />
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-300">{locationLabel}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">{checkedLabel}</p>
        </div>
        <span
          className={`shrink-0 text-slate-400 transition ${expanded ? "rotate-180" : ""}`}
          aria-hidden
        >
          ▼
        </span>
      </button>

      {expanded ? (
        <div className="border-t border-white/10 px-3 pb-3 pt-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300/90">
            {region}
          </p>
          <p className="mt-1 text-sm text-slate-200">{productName}</p>
          {detail ? (
            <p className="mt-2 text-xs leading-relaxed text-slate-400">{detail}</p>
          ) : null}
          {note ? (
            <p className="mt-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-2.5 py-2 text-xs text-amber-100">
              {note}
            </p>
          ) : null}
          {reviewNote ? (
            <p className="mt-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-2 text-xs text-cyan-100">
              {reviewNote}
            </p>
          ) : null}
          {inStock && activeHitId ? (
            <div className="mt-3">
              <HitOutcomeButtons hitId={activeHitId} />
            </div>
          ) : null}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl bg-amber-500 font-bold text-slate-950 active:scale-[0.98]"
          >
            Open store
          </a>
        </div>
      ) : (
        <div className="flex gap-2 border-t border-white/5 px-3 pb-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex min-h-10 flex-1 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10 text-xs font-bold text-amber-100"
          >
            Open store
          </a>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="min-h-10 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-300"
          >
            Details
          </button>
        </div>
      )}
    </article>
  );
}
