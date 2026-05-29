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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    action?: "disable" | "enable" | "resetPassword" | "updateProfile";
    fullName?: string;
    phone?: string;
    email?: string | null;
    photoUrl?: string | null;
    password?: string;
  };

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (body.action === "updateProfile") {
    const fullName = body.fullName?.trim();
    const phone = body.phone?.trim();
    const email = body.email?.trim().toLowerCase() || null;

    if (!fullName || !phone) {
      return NextResponse.json(
        { error: "Full name and phone are required" },
        { status: 400 },
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, id: { not: id } },
      });
      if (existing) {
        return NextResponse.json(
          { error: "A profile with this email already exists" },
          { status: 409 },
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        phone,
        email,
        photoUrl: normalizePhotoUrl(body.photoUrl),
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        photoUrl: true,
        isAdmin: true,
      },
    });

    return NextResponse.json(updated);
  }

  if (user.isAdmin) {
    return NextResponse.json(
      { error: "Admin access is controlled by the admin password" },
      { status: 400 },
    );
  }

  if (body.action === "disable") {
    await prisma.user.update({
      where: { id },
      data: { disabledAt: new Date() },
    });
    return NextResponse.json({ ok: true, disabled: true });
  }

  if (body.action === "enable") {
    await prisma.user.update({
      where: { id },
      data: { disabledAt: null },
    });
    return NextResponse.json({ ok: true, disabled: false });
  }

  if (body.action === "resetPassword") {
    const password = body.password?.trim();
    if (!password || password.length < 5) {
      return NextResponse.json(
        { error: "Password must be at least 5 characters" },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { id },
      data: { passwordHash: hashPassword(password) },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
