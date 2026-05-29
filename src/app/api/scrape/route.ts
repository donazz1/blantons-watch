import { NextResponse } from "next/server";
import { canAccessDashboard } from "@/lib/auth";
import {
  markScheduledScrapeRun,
  shouldRunScheduledScrape,
} from "@/lib/scrape-schedule";
import { runStockCheckCycle } from "@/lib/stock-service";

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const isCron =
    cronSecret && authHeader === `Bearer ${cronSecret}`;
  const url = new URL(request.url);
  const isScheduledRun = isCron && url.searchParams.get("scheduled") === "1";

  const isSignedIn = isCron ? false : await canAccessDashboard();

  if (!isCron && !isSignedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (isScheduledRun) {
      const { shouldRun, state } = await shouldRunScheduledScrape();
      if (!shouldRun) {
        return NextResponse.json({
          checked: 0,
          newHits: 0,
          skipped: true,
          schedule: state,
        });
      }
    }

    const result = await runStockCheckCycle();
    if (isScheduledRun) {
      await markScheduledScrapeRun();
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Stock scrape failed", error);
    return NextResponse.json(
      {
        error: "Stock scrape failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
