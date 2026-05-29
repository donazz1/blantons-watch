import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizePhotoUrl(photoUrl: string | null | undefined): string | null {
  const value = photoUrl?.trim();
  if (!value) return null;
  return value;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { isAdmin: false },
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      phone: true,
      email: true,
      photoUrl: true,
      disabledAt: true,
      lastLoginAt: true,
      createdAt: true,
      passwordHash: true,
    },
  });

  return NextResponse.json(
    users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      photoUrl: user.photoUrl,
      disabledAt: user.disabledAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      hasPassword: Boolean(user.passwordHash),
    })),
  );
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    fullName?: string;
    phone?: string;
    email?: string;
    photoUrl?: string;
    password?: string;
  };

  const fullName = body.fullName?.trim();
  const phone = body.phone?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();

  if (!fullName || !phone || !email || !password) {
    return NextResponse.json(
      {
        error:
          "Full name, phone, email, and temporary password are required",
      },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  if (password.length < 5) {
    return NextResponse.json(
      { error: "Password must be at least 5 characters" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "A profile with this email already exists" },
      { status: 409 },
    );
  }

  const user = await prisma.user.create({
    data: {
      fullName,
      phone,
      email,
      photoUrl: normalizePhotoUrl(body.photoUrl),
      passwordHash: hashPassword(password),
      isAdmin: false,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      photoUrl: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.isAdmin) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
