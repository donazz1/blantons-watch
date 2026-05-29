"use client";

import { useRouter, useSearchParams } from "next/navigation";

type User = {
  id: string;
  fullName: string;
  photoUrl?: string | null;
};

export function UserPicker({ users }: { users: User[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("user") ?? "";

  function onChange(userId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (userId) params.set("user", userId);
    else params.delete("user");
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
        Who are you?
      </span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/90 px-3 py-3 text-white shadow-2xl shadow-black/30 outline-none ring-cyan-300/30 backdrop-blur focus:ring-2"
      >
        <option value="">Select your name</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.fullName}
          </option>
        ))}
      </select>
    </label>
  );
}
