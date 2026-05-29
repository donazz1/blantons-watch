import { NextResponse } from "next/server";
import { sendWeeklySummaryEmail } from "@/lib/notifications";

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const isCron =
    cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isCron) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendWeeklySummaryEmail();
  return NextResponse.json(result);
}
