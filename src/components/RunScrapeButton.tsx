"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RunScrapeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/scrape", { method: "POST" });
      const data = (await res.json()) as { checked?: number; newHits?: number };
      if (!res.ok) throw new Error("Failed");
      setResult(
        `Checked ${data.checked ?? 0} stores. New hits: ${data.newHits ?? 0}.`,
      );
      router.refresh();
    } catch {
      setResult("Scrape failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-100 shadow-xl shadow-black/20 hover:bg-amber-300/20 disabled:opacity-50"
      >
        {loading ? "Checking all sites..." : "Run stock check now"}
      </button>
      {result ? <p className="mt-2 text-xs text-slate-300">{result}</p> : null}
    </div>
  );
}
