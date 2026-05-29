import Link from "next/link";
import { SignOutButton } from "./SignOutButton";
import type { SessionUser } from "@/lib/auth";

export function AppHeader({
  isAdmin,
  sessionUser,
}: {
  isAdmin?: boolean;
  sessionUser?: SessionUser | null;
}) {
  return (
    <header className="app-header sticky top-0 z-20 border-b border-amber-900/30 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-2 px-4 pb-3 pt-2">
        <Link href="/dashboard" className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-amber-400/80">
            Buffalo Trace
          </p>
          <h1 className="truncate font-serif text-base font-black text-amber-50">
            Blanton&apos;s Watch
          </h1>
          {sessionUser ? (
            <p className="truncate text-[11px] text-slate-400">
              {sessionUser.fullName}
            </p>
          ) : null}
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          {isAdmin ? (
            <Link
              href="/admin"
              className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-100"
            >
              Admin
            </Link>
          ) : null}
          {sessionUser && !sessionUser.isAdmin ? (
            <SignOutButton variant="friend" />
          ) : null}
          {sessionUser?.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sessionUser.photoUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white/10"
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}
