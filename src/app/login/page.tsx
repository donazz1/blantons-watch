import { redirect } from "next/navigation";
import { BlantonBottleArt } from "@/components/BlantonBottleArt";
import { FriendLoginForm } from "@/components/FriendLoginForm";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSessionUser()) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 py-8">
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/35 bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-950 px-5 py-8 shadow-2xl">
        <div className="pointer-events-none absolute right-4 top-4 rounded-2xl border border-amber-200/70 bg-white p-2 shadow-xl">
          <BlantonBottleArt className="h-24 w-auto object-contain" />
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300/90">
          Buffalo Trace Distillery
        </p>
        <h1 className="mt-2 max-w-[70%] font-serif text-3xl font-black leading-tight text-amber-50">
          Welcome to Blanton&apos;s Watch
        </h1>
        <p className="mt-3 max-w-[72%] text-sm leading-relaxed text-amber-100/85">
          You&apos;ve been invited to join the private stock monitor. Sign in
          with the email and temporary password from your invite text.
        </p>

        <FriendLoginForm />
      </section>

      <p className="mt-6 text-center text-xs text-slate-500">
        After signing in, use Safari → Share → Add to Home Screen for an app-like
        experience.
      </p>
    </main>
  );
}
