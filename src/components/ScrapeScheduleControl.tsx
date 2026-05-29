"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ScheduleOption = {
  value: string;
  label: string;
};

type ScheduleState = {
  value: string;
  intervalMinutes: number | null;
  lastScheduledRunAt: string | null;
  nextScheduledRunAt: string | null;
};

type Props = {
  initialState: ScheduleState;
  options: ScheduleOption[];
};

function formatDate(value: string | null) {
  if (!value) return "Not yet";
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ScrapeScheduleControl({ initialState, options }: Props) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [value, setValue] = useState(initialState.value);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/scrape-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      const data = (await res.json()) as ScheduleState & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to save schedule");

      setState(data);
      setMessage("Schedule saved.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Schedule could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  const isOff = state.value === "off";

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-white">Scheduled stock checks</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Controls automatic Netlify scrapes. Manual checks still run anytime.
          </p>
        </div>
        <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">
          {isOff ? "Off" : options.find((option) => option.value === state.value)?.label}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Frequency
          </span>
          <select
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm font-bold text-white outline-none ring-cyan-300/30 focus:ring-2"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={save}
          disabled={saving || value === state.value}
          className="self-end rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="mt-4 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
        <p>
          <span className="font-bold text-slate-100">Last scheduled run:</span>{" "}
          {formatDate(state.lastScheduledRunAt)}
        </p>
        <p>
          <span className="font-bold text-slate-100">Next scheduled run:</span>{" "}
          {isOff ? "Off" : formatDate(state.nextScheduledRunAt)}
        </p>
      </div>

      {message ? <p className="mt-3 text-xs text-amber-100">{message}</p> : null}
    </section>
  );
}
