import type { Config } from "@netlify/functions";

const handler = async () => {
  const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL;
  const cronSecret = process.env.CRON_SECRET;

  if (!siteUrl || !cronSecret) {
    console.error("Missing URL or CRON_SECRET for scheduled scrape");
    return new Response("Missing config", { status: 500 });
  }

  const res = await fetch(`${siteUrl}/api/scrape?scheduled=1`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cronSecret}` },
  });

  const body = await res.text();
  console.log("Scheduled scrape:", res.status, body);
  return new Response(body, { status: res.status });
};

export default handler;

export const config: Config = {
  schedule: "*/30 * * * *",
};
