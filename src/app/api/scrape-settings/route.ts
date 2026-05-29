import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  getScrapeScheduleState,
  isScrapeScheduleValue,
  setScrapeSchedule,
} from "@/lib/scrape-schedule";

export async function GET() {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getScrapeScheduleState());
}

export async function PATCH(request: Request) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    value?: unknown;
  } | null;
  const value = typeof body?.value === "string" ? body.value : "";

  if (!isScrapeScheduleValue(value)) {
    return NextResponse.json(
      { error: "Invalid scrape schedule" },
      { status: 400 },
    );
  }

  return NextResponse.json(await setScrapeSchedule(value));
}
