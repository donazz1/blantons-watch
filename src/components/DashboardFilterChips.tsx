"use client";

export type DashboardFilter =
  | "all"
  | "found"
  | "ontario"
  | "adjacent"
  | "review";

const CHIPS: { id: DashboardFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "found", label: "Found" },
  { id: "ontario", label: "Ontario" },
  { id: "adjacent", label: "Quebec+" },
  { id: "review", label: "Review" },
];

type Props = {
  active: DashboardFilter;
  onChange: (filter: DashboardFilter) => void;
  counts: Partial<Record<DashboardFilter, number>>;
};

export function DashboardFilterChips({ active, onChange, counts }: Props) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Filter stores"
    >
      {CHIPS.map((chip) => {
        const count = counts[chip.id];
        const selected = active === chip.id;
        return (
          <button
            key={chip.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(chip.id)}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold transition active:scale-95 ${
              selected
                ? "border-amber-400/60 bg-amber-500/25 text-amber-50"
                : "border-white/15 bg-white/5 text-slate-300"
            }`}
          >
            {chip.label}
            {count != null && count > 0 ? (
              <span className="ml-1.5 opacity-80">({count})</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
