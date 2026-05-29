import { NextResponse } from "next/server";
import {
  authenticateFriend,
  clearAdminSession,
  clearFriendSession,
  createAdminSession,
  createFriendSession,
} from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    action?: string;
    email?: string;
    password?: string;
  };

  if (body.action === "logout") {
    await clearFriendSession();
    return NextResponse.json({ ok: true });
  }

  const email = body.email?.trim();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  const result = await authenticateFriend(email, password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  if (result.isAdmin) {
    await clearFriendSession();
    await createAdminSession(result.userId);
    return NextResponse.json({ ok: true, isAdmin: true });
  }

  await clearAdminSession();
  await createFriendSession(result.userId);
  return NextResponse.json({ ok: true, isAdmin: false });
}
