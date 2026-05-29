"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  variant: "friend" | "admin";
};

export function SignOutButton({ variant }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    const url =
      variant === "admin" ? "/api/auth/admin" : "/api/auth/friend";
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push(variant === "admin" ? "/admin/login" : "/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      disabled={loading}
      className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-bold text-slate-300"
    >
      {loading ? "…" : "Sign out"}
    </button>
  );
}
