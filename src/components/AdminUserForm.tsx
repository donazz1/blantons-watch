"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProfilePhotoInput } from "@/components/ProfilePhotoInput";
import {
  buildSmsHref,
  generateTemporaryPassword,
} from "@/lib/sms-invite";

type CreatedInvite = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

export function AdminUserForm({ loginUrl }: { loginUrl: string }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(() => generateTemporaryPassword());
  const [photoUrl, setPhotoUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [createdInvite, setCreatedInvite] = useState<CreatedInvite | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setCreatedInvite(null);
    try {
      const invite = {
        fullName,
        email,
        phone,
        password,
      };
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          password,
          photoUrl: photoUrl || null,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setCreatedInvite(invite);
      setFullName("");
      setPhone("");
      setEmail("");
      setPassword(generateTemporaryPassword());
      setPhotoUrl("");
      setStatus(
        "Friend created. Give them the login link and temporary password (you cannot view it again).",
      );
      router.refresh();
    } catch (err) {
      setStatus(
        err instanceof Error ? err.message : "Could not add user.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3"
    >
      <input
        required
        placeholder="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none ring-cyan-300/30 focus:ring-2"
      />
      <input
        required
        type="email"
        placeholder="Email (login + alerts)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none ring-cyan-300/30 focus:ring-2"
      />
      <input
        required
        placeholder="Phone (+1...)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none ring-cyan-300/30 focus:ring-2"
      />
      <input
        required
        type="password"
        minLength={5}
        placeholder="Temporary password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none ring-cyan-300/30 focus:ring-2"
      />
      <button
        type="button"
        onClick={() => setPassword(generateTemporaryPassword())}
        className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-slate-200"
      >
        Generate new temporary password
      </button>
      <ProfilePhotoInput
        value={photoUrl}
        onChange={setPhotoUrl}
        label="Friend photo"
        name="new-friend-photo"
      />
      <p className="text-xs text-slate-400">
        This temporary password will be included in the invite text. You can
        reset it anytime.
      </p>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-amber-700 py-2 font-medium text-white hover:bg-amber-600 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Create friend account"}
      </button>
      {status ? <p className="text-sm text-slate-200">{status}</p> : null}
      {createdInvite ? (
        <a
          href={buildSmsHref({ ...createdInvite, loginUrl })}
          className="block rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-center text-sm font-bold text-emerald-100"
        >
          Text invite to {createdInvite.fullName}
        </a>
      ) : null}
    </form>
  );
}
