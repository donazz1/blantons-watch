import { prisma } from "@/lib/db";

const SCHEDULE_KEY = "scrape.scheduleMinutes";
const LAST_RUN_KEY = "scrape.lastScheduledRunAt";

export const SCRAPE_SCHEDULE_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "30", label: "Every 30 minutes" },
  { value: "60", label: "Every 60 minutes" },
  { value: "120", label: "Every 2 hours" },
  { value: "240", label: "Every 4 hours" },
  { value: "480", label: "Every 8 hours" },
  { value: "1440", label: "Once a day" },
] as const;

export type ScrapeScheduleValue =
  (typeof SCRAPE_SCHEDULE_OPTIONS)[number]["value"];

const DEFAULT_SCHEDULE_VALUE: ScrapeScheduleValue = "240";

export type ScrapeScheduleState = {
  value: ScrapeScheduleValue;
  intervalMinutes: number | null;
  lastScheduledRunAt: string | null;
  nextScheduledRunAt: string | null;
};

const VALID_VALUES = new Set<string>(
  SCRAPE_SCHEDULE_OPTIONS.map((option) => option.value),
);

export function isScrapeScheduleValue(
  value: string,
): value is ScrapeScheduleValue {
  return VALID_VALUES.has(value);
}

export async function getScrapeScheduleState(): Promise<ScrapeScheduleState> {
  const [schedule, lastRun] = await Promise.all([
    prisma.appSetting.findUnique({ where: { key: SCHEDULE_KEY } }),
    prisma.appSetting.findUnique({ where: { key: LAST_RUN_KEY } }),
  ]);

  const rawValue = schedule?.value ?? DEFAULT_SCHEDULE_VALUE;
  const value = isScrapeScheduleValue(rawValue)
    ? rawValue
    : DEFAULT_SCHEDULE_VALUE;
  const intervalMinutes = value === "off" ? null : Number(value);
  const lastScheduledRunAt = lastRun?.value ?? null;
  const nextScheduledRunAt =
    intervalMinutes && lastScheduledRunAt
      ? new Date(
          new Date(lastScheduledRunAt).getTime() + intervalMinutes * 60_000,
        ).toISOString()
      : null;

  return {
    value,
    intervalMinutes,
    lastScheduledRunAt,
    nextScheduledRunAt,
  };
}

export async function setScrapeSchedule(value: ScrapeScheduleValue) {
  await prisma.appSetting.upsert({
    where: { key: SCHEDULE_KEY },
    create: { key: SCHEDULE_KEY, value },
    update: { value },
  });

  return getScrapeScheduleState();
}

export async function shouldRunScheduledScrape(now = new Date()) {
  const state = await getScrapeScheduleState();
  if (!state.intervalMinutes) {
    return { shouldRun: false, state };
  }

  if (!state.lastScheduledRunAt) {
    return { shouldRun: true, state };
  }

  const lastRunTime = new Date(state.lastScheduledRunAt).getTime();
  const nextRunTime = lastRunTime + state.intervalMinutes * 60_000;

  return { shouldRun: now.getTime() >= nextRunTime, state };
}

export async function markScheduledScrapeRun(now = new Date()) {
  await prisma.appSetting.upsert({
    where: { key: LAST_RUN_KEY },
    create: { key: LAST_RUN_KEY, value: now.toISOString() },
    update: { value: now.toISOString() },
  });
}
