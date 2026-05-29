"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function FriendLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/friend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-200/90">
          Email
        </span>
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full min-h-12 rounded-2xl border border-white/15 bg-slate-950/80 px-4 text-white outline-none ring-amber-400/40 focus:ring-2"
          placeholder="you@example.com"
        />
      </label>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-200/90">
          Password
        </span>
        <input
          required
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full min-h-12 rounded-2xl border border-white/15 bg-slate-950/80 px-4 text-white outline-none ring-amber-400/40 focus:ring-2"
          placeholder="Password from Don's invite"
        />
      </label>
      {error ? (
        <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="min-h-12 w-full rounded-2xl bg-amber-500 font-black text-slate-950 active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Enter Blanton's Watch"}
      </button>
    </form>
  );
}
