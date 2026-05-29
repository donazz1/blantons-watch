import { getStoreDisplayMeta } from "@/lib/store-display";

type HitForEmail = {
  id: string;
  productName: string;
  store: {
    name: string;
    slug: string;
    url: string;
    region: string;
  };
};

function appBaseUrl(): string {
  const base =
    process.env.APP_BASE_URL?.replace(/\/$/, "") ||
    process.env.URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  return base;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildStockHitEmail(hit: HitForEmail) {
  const base = appBaseUrl();
  const location = getStoreDisplayMeta(hit.store.slug, hit.store.region).locationLabel;
  const dashboardUrl = `${base}/dashboard`;
  const storeUrl = hit.store.url;

  const subject = `Blanton's alert: ${hit.productName} at ${hit.store.name}`;

  const html = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#020617;color:#f8fafc;font-family:Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:linear-gradient(135deg,#f59e0b22,#06b6d422);padding:20px;border-radius:16px 16px 0 0;">
        <p style="margin:0;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#fef3c7;">Blanton's Stock Monitor</p>
        <h1 style="margin:12px 0 0;font-size:24px;color:#ffffff;">May be in stock</h1>
      </div>
      <div style="background:#0f172a;border:1px solid #334155;border-radius:16px;padding:20px;margin-top:16px;">
        <p style="margin:0 0 8px;font-size:18px;font-weight:bold;color:#ffffff;">${escapeHtml(hit.productName)}</p>
        <p style="margin:0 0 4px;color:#cbd5e1;"><strong>Store:</strong> ${escapeHtml(hit.store.name)}</p>
        <p style="margin:0 0 4px;color:#cbd5e1;"><strong>Location:</strong> ${escapeHtml(location)}</p>
        <p style="margin:0 0 16px;color:#94a3b8;">Status: In stock</p>
        <p style="margin:0 0 12px;">
          <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#f59e0b;color:#020617;text-decoration:none;font-weight:bold;padding:12px 18px;border-radius:999px;">Open Blanton Monitor</a>
        </p>
        <p style="margin:0;">
          <a href="${escapeHtml(storeUrl)}" style="color:#67e8f9;">Open store page</a>
        </p>
      </div>
      <p style="margin:16px 0 0;font-size:12px;color:#64748b;">You are receiving this because you are on the Blanton's alert list.</p>
    </div>
  </body>
</html>`.trim();

  const text = `${hit.productName} may be in stock at ${hit.store.name} (${location}). Open: ${dashboardUrl}`;

  return { subject, html, text, dashboardUrl, storeUrl };
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return { ok: false, error: "RESEND_API_KEY or RESEND_FROM_EMAIL not set" };
  }

  if (!to.includes("@")) {
    return { ok: false, error: "Invalid email address" };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html,
    text,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
