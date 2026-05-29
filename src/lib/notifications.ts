import { prisma } from "@/lib/db";
import { buildStockHitEmail, sendEmail } from "@/lib/email";

type AlertUser = {
  id: string;
  fullName: string;
  email: string | null;
};

export async function sendStockAlerts(hitIds: string[]) {
  const hits = await prisma.hit.findMany({
    where: { id: { in: hitIds } },
    include: { store: true },
  });

  const users = await prisma.user.findMany({
    where: { isAdmin: false },
    select: { id: true, fullName: true, email: true },
  });

  for (const hit of hits) {
    const message = `Blanton's alert: ${hit.productName} may be in stock at ${hit.store.name} (${hit.store.region}). ${hit.store.url}`;

    await prisma.alertLog.create({
      data: {
        hitId: hit.id,
        message,
        channel: "in-app",
      },
    });

    await prisma.hit.update({
      where: { id: hit.id },
      data: { notifiedAt: new Date() },
    });

    const { subject, html, text } = buildStockHitEmail(hit);
    await sendHitEmails(users, hit.id, subject, html, text);
  }
}

async function sendHitEmails(
  users: AlertUser[],
  hitId: string,
  subject: string,
  html: string,
  text: string,
) {
  for (const user of users) {
    if (!user.email?.trim()) {
      await prisma.alertLog.create({
        data: {
          hitId,
          message: `Email to ${user.fullName}: skipped (no email on file)`,
          channel: "email-skipped",
        },
      });
      continue;
    }

    const result = await sendEmail(user.email.trim(), subject, html, text);

    await prisma.alertLog.create({
      data: {
        hitId,
        message: `Email to ${user.fullName}: ${result.ok ? "sent" : result.error ?? "failed"}`,
        channel: result.ok ? "email" : "email-error",
      },
    });
  }
}

export async function sendWeeklySummaryEmail() {
  const { getWeeklyHitSummary } = await import("@/lib/stock-service");
  const hits = await getWeeklyHitSummary();

  const lines =
    hits.length === 0
      ? ["No Blanton's stock hits in the past 7 days."]
      : hits.map(
          (h) =>
            `- ${h.detectedAt.toLocaleString("en-CA")}: ${h.productName} @ ${h.store.name} (${h.outcomes.length} responses)`,
        );

  const message = `Blanton's weekly summary\n\n${lines.join("\n")}`;
  const subject =
    hits.length === 0
      ? "Blanton's weekly summary — no hits"
      : `Blanton's weekly summary — ${hits.length} hit(s)`;

  await prisma.alertLog.create({
    data: { message, channel: "weekly-summary" },
  });

  const recipients = await prisma.user.findMany({
    where: {
      OR: [
        { isAdmin: true },
        { email: { not: null } },
      ],
    },
    select: { fullName: true, email: true, isAdmin: true },
  });

  const html = `<pre style="font-family:Arial,sans-serif;white-space:pre-wrap;color:#0f172a;">${message.replace(/</g, "&lt;")}</pre>`;

  for (const user of recipients) {
    if (!user.email?.trim()) continue;
    const result = await sendEmail(user.email.trim(), subject, html, message);
    await prisma.alertLog.create({
      data: {
        message: `Weekly summary to ${user.fullName}: ${result.ok ? "sent" : result.error ?? "failed"}`,
        channel: result.ok ? "email-weekly" : "email-error",
      },
    });
  }

  return { hitCount: hits.length, message };
}
