import type { StockStatus } from "@prisma/client";

const styles: Record<StockStatus, string> = {
  IN_STOCK:
    "bg-emerald-400/20 text-emerald-50 border-emerald-400/60 shadow-[0_0_12px_rgba(52,211,153,0.25)]",
  OUT_OF_STOCK: "bg-slate-500/15 text-slate-200 border-slate-400/35",
  UNKNOWN: "bg-amber-400/15 text-amber-50 border-amber-400/45",
  ERROR: "bg-rose-400/15 text-rose-50 border-rose-400/45",
};

const labels: Record<StockStatus, string> = {
  IN_STOCK: "Found",
  OUT_OF_STOCK: "Out",
  UNKNOWN: "Unknown",
  ERROR: "Failed",
};

export function StatusBadge({
  status,
  compact = false,
}: {
  status: StockStatus;
  compact?: boolean;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border font-bold backdrop-blur ${
        compact ? "px-2 py-0.5 text-[10px] uppercase tracking-wide" : "px-2.5 py-0.5 text-xs"
      } ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
