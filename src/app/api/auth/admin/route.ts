import { NextResponse } from "next/server";
import {
  createAdminSession,
  clearAdminSession,
  verifyAdminPassword,
} from "@/lib/auth";
import { ensureAdminUser } from "@/lib/seed";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string; action?: string };

  if (body.action === "logout") {
    await clearAdminSession();
    return NextResponse.json({ ok: true });
  }

  if (!body.password || !verifyAdminPassword(body.password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const admin = await ensureAdminUser();
  await createAdminSession(admin.id);
  return NextResponse.json({ ok: true });
}
