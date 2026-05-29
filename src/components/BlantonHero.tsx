import { BlantonBottleArt } from "./BlantonBottleArt";

export type FoundStoreSummary = {
  id: string;
  name: string;
  productName: string;
  locationLabel: string;
  url: string;
};

type Props = {
  anyInStock: boolean;
  foundStores: FoundStoreSummary[];
  foundCount: number;
  storeCount: number;
};

export function BlantonHero({
  anyInStock,
  foundStores,
  foundCount,
  storeCount,
}: Props) {
  return (
    <section
      id="hero"
      className={`blanton-hero relative overflow-hidden rounded-3xl border px-4 py-5 shadow-2xl ${
        anyInStock
          ? "border-emerald-400/50 bg-gradient-to-br from-emerald-500/25 via-amber-950/40 to-slate-950"
          : "border-amber-500/30 bg-gradient-to-br from-amber-900/40 via-slate-900 to-slate-950"
      }`}
    >
      <div className="pointer-events-none absolute right-4 top-4 rounded-2xl border border-amber-200/70 bg-white p-1.5 shadow-xl shadow-black/30">
        <BlantonBottleArt className="h-20 w-auto object-contain" />
      </div>

      <div className="relative z-10 max-w-[68%]">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-200/90">
          Buffalo Trace Distillery
        </p>
        <h2 className="mt-1 font-serif text-2xl font-black tracking-tight text-amber-50">
          Blanton&apos;s Watch
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-amber-100/80">
          Single barrel alerts across Canada
        </p>

        {anyInStock ? (
          <div className="mt-4" role="alert">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
              Found now · {foundCount}
            </p>
            <p className="mt-1 text-sm font-semibold text-emerald-50">
              Tap a store below — move fast.
            </p>
            <ul className="mt-3 space-y-2">
              {foundStores.map((store) => (
                <li key={store.id}>
                  <a
                    href={store.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl border border-emerald-300/40 bg-slate-950/70 px-3 py-2.5 active:scale-[0.98]"
                  >
                    <span className="block text-sm font-black text-white">
                      {store.name}
                    </span>
                    <span className="block text-[11px] text-emerald-100/90">
                      {store.locationLabel}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-slate-200">
            No confirmed stock right now. Monitoring {storeCount} sources.
          </p>
        )}
      </div>
    </section>
  );
}
