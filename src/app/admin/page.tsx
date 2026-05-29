import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminFriendList } from "@/components/AdminFriendList";
import { AdminUserForm } from "@/components/AdminUserForm";
import { AppHeader } from "@/components/AppHeader";
import { LogoutButton } from "@/components/LogoutButton";
import { RunScrapeButton } from "@/components/RunScrapeButton";
import { ScrapeScheduleControl } from "@/components/ScrapeScheduleControl";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAppBaseUrl } from "@/lib/local-url";
import {
  getScrapeScheduleState,
  SCRAPE_SCHEDULE_OPTIONS,
} from "@/lib/scrape-schedule";
import { ensureAdminUser } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) redirect("/admin/login");

  await ensureAdminUser();

  const users = await prisma.user.findMany({
    orderBy: [{ isAdmin: "desc" }, { fullName: "asc" }],
  });

  const loginUrl = `${getAppBaseUrl()}/login`;
  const adminPassword = process.env.ADMIN_PASSWORD ?? "blantons-admin";
  const scrapeSchedule = await getScrapeScheduleState();

  const friends = users.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    photoUrl: user.photoUrl,
    isAdmin: user.isAdmin,
    disabledAt: user.disabledAt?.toISOString() ?? null,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    hasPassword: user.isAdmin || Boolean(user.passwordHash),
  }));

  return (
    <>
      <AppHeader isAdmin />
      <main className="mx-auto max-w-3xl px-4 py-6 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">
              Admin
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Create friend accounts, share the login link, reset passwords, or
              disable access.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-slate-100"
          >
            Back to app
          </Link>
        </div>

        <div className="mt-6 grid gap-4">
          <ScrapeScheduleControl
            initialState={scrapeSchedule}
            options={[...SCRAPE_SCHEDULE_OPTIONS]}
          />
          <RunScrapeButton />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <AdminUserForm loginUrl={loginUrl} />
          <AdminFriendList
            profiles={friends}
            loginUrl={loginUrl}
            adminPassword={adminPassword}
          />
        </div>

        <LogoutButton />
      </main>
    </>
  );
}
