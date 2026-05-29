"use client";

import { useState } from "react";

type HitOutcome = "PURCHASED" | "NOT_AVAILABLE" | "IN_STOCK_NOT_PURCHASED";

type Props = {
  hitId: string;
};

const outcomeMessages: Record<HitOutcome, string> = {
  PURCHASED: "Marked: We purchased it",
  NOT_AVAILABLE: "Marked: They didn't have it",
  IN_STOCK_NOT_PURCHASED: "Marked: In stock, but we passed",
};

export function HitOutcomeButtons({ hitId }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(outcome: HitOutcome) {
    setLoading(outcome);
    setMessage(null);

    try {
      const res = await fetch(`/api/hits/${hitId}/outcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome }),
      });

      if (!res.ok) throw new Error("Failed");
      setMessage(outcomeMessages[outcome]);
    } catch {
      setMessage("Could not save. Try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-3">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-100">
        Respond to this hit
      </p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          disabled={!!loading}
          onClick={() => submit("PURCHASED")}
          className="min-h-11 flex-1 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white active:scale-[0.98] disabled:opacity-50"
        >
          We purchased it
        </button>
        <button
          type="button"
          disabled={!!loading}
          onClick={() => submit("IN_STOCK_NOT_PURCHASED")}
          className="min-h-11 flex-1 rounded-xl bg-amber-600 px-3 py-2.5 text-sm font-bold text-white active:scale-[0.98] disabled:opacity-50"
        >
          In stock, passed
        </button>
        <button
          type="button"
          disabled={!!loading}
          onClick={() => submit("NOT_AVAILABLE")}
          className="min-h-11 flex-1 rounded-xl border border-slate-500 bg-slate-800 px-3 py-2.5 text-sm font-bold text-white active:scale-[0.98] disabled:opacity-50"
        >
          Not there
        </button>
      </div>
      {message ? <p className="mt-2 text-xs text-slate-200">{message}</p> : null}
    </div>
  );
}
