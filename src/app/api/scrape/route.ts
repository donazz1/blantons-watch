import { NextResponse } from "next/server";
import { canAccessDashboard } from "@/lib/auth";
import { runStockCheckCycle } from "@/lib/stock-service";

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const isCron =
    cronSecret && authHeader === `Bearer ${cronSecret}`;

  const isSignedIn = await canAccessDashboard();

  if (!isCron && !isSignedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runStockCheckCycle();
  return NextResponse.json(result);
}
