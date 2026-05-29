"use client";

import { useState } from "react";

type User = { id: string; fullName: string; photoUrl: string | null };

type Props = {
  hitId: string;
  storeName: string;
  productName: string;
  locationLabel: string;
  url: string;
  detectedAt: Date;
  users: User[];
  currentUserId: string | null;
};

export function HitCard({
  hitId,
  storeName,
  productName,
  locationLabel,
  url,
  detectedAt,
  users,
  currentUserId,
}: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  type HitOutcome = "PURCHASED" | "NOT_AVAILABLE" | "IN_STOCK_NOT_PURCHASED";

  const outcomeMessages: Record<HitOutcome, string> = {
    PURCHASED: "Marked: We purchased it",
    NOT_AVAILABLE: "Marked: They didn't have it",
    IN_STOCK_NOT_PURCHASED: "Marked: In stock, but we passed",
  };

  async function submit(outcome: HitOutcome) {
    if (!currentUserId) {
      setMessage("Select your name at the top first.");
      return;
    }
    setLoading(outcome);
    setMessage(null);
    try {
      const res = await fetch(`/api/hits/${hitId}/outcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, outcome }),
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
    <article className="rounded-2xl border border-emerald-500/40 bg-slate-900 p-4 shadow-lg shadow-slate-950/40">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
        Stock hit
      </p>
      <h3 className="mt-1 text-lg font-semibold text-white">
        {productName}
      </h3>
      <p className="text-sm text-slate-200">
        {storeName} · {locationLabel}
      </p>
      <p className="text-xs text-slate-400">
        Detected {detectedAt.toLocaleString("en-CA")}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-sm font-medium text-amber-300 hover:text-amber-200 hover:underline"
      >
        Open product page
      </a>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!!loading}
          onClick={() => submit("PURCHASED")}
          className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          We purchased it
        </button>
        <button
          type="button"
          disabled={!!loading}
          onClick={() => submit("IN_STOCK_NOT_PURCHASED")}
          className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
        >
          In stock, but passed
        </button>
        <button
          type="button"
          disabled={!!loading}
          onClick={() => submit("NOT_AVAILABLE")}
          className="rounded-lg border border-slate-500 bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          They didn&apos;t have it
        </button>
      </div>
      {message ? <p className="mt-2 text-xs text-slate-200">{message}</p> : null}
      <div className="mt-3 flex -space-x-2">
        {users.map((u) =>
          u.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={u.id}
              src={u.photoUrl}
              alt={u.fullName}
              className="h-8 w-8 rounded-full border-2 border-white object-cover"
            />
          ) : (
            <span
              key={u.id}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-amber-700 text-xs text-white"
            >
              {u.fullName.charAt(0)}
            </span>
          ),
        )}
      </div>
    </article>
  );
}
