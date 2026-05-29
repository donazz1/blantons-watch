import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { HitOutcomeType } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ hitId: string }> },
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { hitId } = await params;
  const body = (await request.json()) as {
    outcome?: HitOutcomeType;
  };

  if (!body.outcome) {
    return NextResponse.json({ error: "outcome required" }, { status: 400 });
  }

  const userId = sessionUser.id;

  const validOutcomes: HitOutcomeType[] = [
    "PURCHASED",
    "NOT_AVAILABLE",
    "IN_STOCK_NOT_PURCHASED",
  ];

  if (!validOutcomes.includes(body.outcome)) {
    return NextResponse.json({ error: "Invalid outcome" }, { status: 400 });
  }

  const outcome = await prisma.hitOutcome.upsert({
    where: {
      hitId_userId: { hitId, userId },
    },
    create: {
      hitId,
      userId,
      outcome: body.outcome,
    },
    update: { outcome: body.outcome },
  });

  const hitOutcomes = await prisma.hitOutcome.findMany({
    where: { hitId },
  });

  if (hitOutcomes.length >= 1) {
    await prisma.hit.update({
      where: { id: hitId },
      data: { resolvedAt: new Date() },
    });
  }

  return NextResponse.json(outcome);
}
