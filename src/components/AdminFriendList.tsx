"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProfilePhotoInput } from "@/components/ProfilePhotoInput";
import {
  buildSmsHref,
  generateTemporaryPassword,
} from "@/lib/sms-invite";

type Profile = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  photoUrl: string | null;
  isAdmin: boolean;
  disabledAt: string | null;
  lastLoginAt: string | null;
  hasPassword: boolean;
};

type Props = {
  profiles: Profile[];
  loginUrl: string;
  adminPassword: string;
};

type ProfileDraft = {
  fullName: string;
  email: string;
  phone: string;
  photoUrl: string;
};

type PatchBody =
  | { action: "disable" | "enable" | "resetPassword"; password?: string }
  | ({ action: "updateProfile" } & ProfileDraft);

export function AdminFriendList({ profiles, loginUrl, adminPassword }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);

  async function patchUser(id: string, body: PatchBody): Promise<boolean> {
    setBusyId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      router.refresh();
      if (body.action === "resetPassword") {
        setMessage("Password reset. Share the new password with your friend.");
      }
      return true;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Action failed");
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function removeUser(id: string) {
    if (!confirm("Delete this friend permanently?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.refresh();
    } catch {
      setMessage("Could not delete friend.");
    } finally {
      setBusyId(null);
    }
  }

  async function resetPassword(profile: Profile) {
    const password = prompt(
      "New temporary password:",
      generateTemporaryPassword(),
    );
    if (!password) return;
    const saved = await patchUser(profile.id, { action: "resetPassword", password });
    if (!saved) return;
    window.location.href = buildSmsHref({
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      loginUrl,
      password,
    });
  }

  async function textInvite(profile: Profile) {
    const password = generateTemporaryPassword();
    const saved = await patchUser(profile.id, {
      action: "resetPassword",
      password,
    });
    if (!saved) return;

    window.location.href = buildSmsHref({
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      loginUrl,
      password,
    });
  }

  function startEditing(profile: Profile) {
    setEditingId(profile.id);
    setMessage(null);
    setDraft({
      fullName: profile.fullName,
      email: profile.email ?? "",
      phone: profile.phone,
      photoUrl: profile.photoUrl ?? "",
    });
  }

  async function saveProfile(id: string) {
    if (!draft) return;
    const saved = await patchUser(id, { action: "updateProfile", ...draft });
    if (!saved) return;
    setEditingId(null);
    setDraft(null);
    setMessage("Profile saved.");
  }

  return (
    <>
      <p className="mb-3 text-xs text-slate-400">
        Share login link:{" "}
        <span className="break-all font-mono text-amber-300">{loginUrl}</span>
      </p>
      {message ? <p className="mb-3 text-sm text-slate-200">{message}</p> : null}
      <ul className="space-y-3">
        {profiles.map((user) => {
          const disabled = Boolean(user.disabledAt);
          const editing = editingId === user.id && draft;
          return (
            <li
              key={user.id}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 shadow-xl shadow-black/20"
            >
              {editing ? (
                <div className="space-y-3">
                  <input
                    required
                    value={draft.fullName}
                    onChange={(e) =>
                      setDraft({ ...draft, fullName: e.target.value })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none ring-cyan-300/30 focus:ring-2"
                  />
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(e) =>
                      setDraft({ ...draft, email: e.target.value })
                    }
                    placeholder="Email"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none ring-cyan-300/30 focus:ring-2"
                  />
                  <input
                    required
                    value={draft.phone}
                    onChange={(e) =>
                      setDraft({ ...draft, phone: e.target.value })
                    }
                    placeholder="Phone"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none ring-cyan-300/30 focus:ring-2"
                  />
                  <ProfilePhotoInput
                    value={draft.photoUrl}
                    onChange={(photoUrl) => setDraft({ ...draft, photoUrl })}
                    label="Profile photo"
                    name={`profile-photo-${user.id}`}
                  />
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  {user.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.photoUrl}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-700 text-lg text-white">
                      {user.fullName.charAt(0)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">
                      {user.fullName}
                      {user.isAdmin ? (
                        <span className="ml-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-cyan-100">
                          Admin
                        </span>
                      ) : null}
                    </p>
                    <p className="text-sm text-slate-300">{user.email}</p>
                    <p className="text-sm text-slate-400">{user.phone}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {user.isAdmin
                        ? "Admin profile · Uses admin password"
                        : disabled
                          ? "Disabled"
                          : user.hasPassword
                            ? "Active"
                            : "No password set"}
                      {user.lastLoginAt
                        ? ` · Last login ${new Date(user.lastLoginAt).toLocaleString("en-CA")}`
                        : ""}
                    </p>
                  </div>
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {editing ? (
                  <>
                    <button
                      type="button"
                      disabled={busyId === user.id}
                      onClick={() => void saveProfile(user.id)}
                      className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-black text-slate-950"
                    >
                      Save profile
                    </button>
                    <button
                      type="button"
                      disabled={busyId === user.id}
                      onClick={() => {
                        setEditingId(null);
                        setDraft(null);
                      }}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-slate-200"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={busyId === user.id}
                      onClick={() => startEditing(user)}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-slate-200"
                    >
                      Edit profile
                    </button>
                    {user.isAdmin ? (
                      <a
                        href={buildSmsHref({
                          fullName: user.fullName,
                          email: user.email,
                          phone: user.phone,
                          loginUrl,
                          password: adminPassword,
                        })}
                        className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold text-cyan-100"
                      >
                        Text invite
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled={busyId === user.id}
                        onClick={() => void textInvite(user)}
                        className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-100"
                      >
                        Text invite
                      </button>
                    )}
                  </>
                )}
                {user.isAdmin || editing ? null : (
                  <>
                    <button
                      type="button"
                      disabled={busyId === user.id}
                      onClick={() =>
                        void patchUser(user.id, {
                          action: disabled ? "enable" : "disable",
                        })
                      }
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-slate-200"
                    >
                      {disabled ? "Enable" : "Disable"}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === user.id}
                      onClick={() => void resetPassword(user)}
                      className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-100"
                    >
                      Reset password
                    </button>
                    <button
                      type="button"
                      disabled={busyId === user.id}
                      onClick={() => void removeUser(user.id)}
                      className="rounded-lg border border-rose-400/30 px-3 py-1.5 text-xs font-bold text-rose-200"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
        {profiles.length === 0 ? (
          <p className="text-sm text-slate-400">No profiles added yet.</p>
        ) : null}
      </ul>
    </>
  );
}
