"use client";

import { ReactNode, useState } from "react";

type Props = {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function CollapsibleAdminSection({
  title,
  subtitle,
  defaultOpen = true,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl shadow-black/20">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <span>
          <span className="block font-bold text-white">{title}</span>
          {subtitle ? (
            <span className="mt-1 block text-xs leading-relaxed text-slate-400">
              {subtitle}
            </span>
          ) : null}
        </span>
        <span className="shrink-0 rounded-full border border-white/15 px-3 py-1 text-xs font-bold text-slate-200">
          {open ? "Collapse" : "Open"}
        </span>
      </button>
      {open ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
