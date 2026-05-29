import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

const ADMIN_COOKIE = "blantons_admin_session";
const FRIEND_COOKIE = "blantons_friend_session";

function adminSecret() {
  return new TextEncoder().encode(
    process.env.SESSION_SECRET ??
      process.env.ADMIN_PASSWORD ??
      "change-me-in-production",
  );
}

function friendSecret() {
  return new TextEncoder().encode(
    process.env.FRIEND_SESSION_SECRET ??
      process.env.SESSION_SECRET ??
      process.env.ADMIN_PASSWORD ??
      "friend-session-secret-change-me",
  );
}

function useSecureCookies(): boolean {
  const publicUrl = process.env.APP_BASE_URL ?? process.env.URL ?? "";
  return publicUrl.startsWith("https://");
}

export async function createAdminSession(userId: string) {
  const token = await new SignJWT({ role: "admin", userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(adminSecret());

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: useSecureCookies(),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return (await getAdminSessionUser()) !== null;
}

async function getAdminSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, adminSecret());
    if (payload.role !== "admin" || typeof payload.userId !== "string") {
      return null;
    }

    const admin = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!admin?.isAdmin) return null;

    return {
      id: admin.id,
      fullName: admin.fullName,
      email: admin.email,
      photoUrl: admin.photoUrl,
      isAdmin: true,
    };
  } catch {
    return null;
  }
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "blantons-admin";
  return password.trim() === expected;
}

export async function createFriendSession(userId: string) {
  const token = await new SignJWT({ role: "friend", userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(friendSecret());

  const cookieStore = await cookies();
  cookieStore.set(FRIEND_COOKIE, token, {
    httpOnly: true,
    secure: useSecureCookies(),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearFriendSession() {
  const cookieStore = await cookies();
  cookieStore.delete(FRIEND_COOKIE);
}

async function getFriendSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(FRIEND_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, friendSecret());
    if (payload.role !== "friend" || typeof payload.userId !== "string") {
      return null;
    }
    return payload.userId;
  } catch {
    return null;
  }
}

export type SessionUser = {
  id: string;
  fullName: string;
  email: string | null;
  photoUrl: string | null;
  isAdmin: boolean;
};

export async function getFriendSessionUser(): Promise<SessionUser | null> {
  const userId = await getFriendSessionUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.isAdmin || user.disabledAt || !user.passwordHash) {
    return null;
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    photoUrl: user.photoUrl,
    isAdmin: false,
  };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const admin = await getAdminSessionUser();
  if (admin) return admin;

  return getFriendSessionUser();
}

export async function canAccessDashboard(): Promise<boolean> {
  return (await getSessionUser()) !== null;
}

export async function authenticateFriend(
  email: string,
  password: string,
): Promise<
  { ok: true; userId: string; isAdmin: boolean } | { ok: false; error: string }
> {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: {
      email: { equals: normalized },
    },
  });

  if (!user) {
    return { ok: false, error: "Invalid email or password" };
  }

  if (user.isAdmin) {
    if (!verifyAdminPassword(password)) {
      return { ok: false, error: "Invalid email or password" };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return { ok: true, userId: user.id, isAdmin: true };
  }

  if (user.disabledAt) {
    return { ok: false, error: "This account has been disabled" };
  }

  if (!user.passwordHash) {
    return {
      ok: false,
      error: "Account not ready — ask the admin to reset your password",
    };
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return { ok: false, error: "Invalid email or password" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return { ok: true, userId: user.id, isAdmin: false };
}
