const DEFAULT_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-CA,en;q=0.9",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  Referer: "https://www.google.com/",
  "Upgrade-Insecure-Requests": "1",
};

export type FetchResult =
  | { ok: true; html: string; status: number; attempts: number }
  | { ok: false; error: string; status?: number; attempts: number };

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchPage(
  url: string,
  timeoutMs = 25000,
  maxAttempts = 3,
): Promise<FetchResult> {
  let lastError = "Fetch failed";
  let lastStatus: number | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: DEFAULT_HEADERS,
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });

      const html = await response.text();
      lastStatus = response.status;

      if (response.ok) {
        return { ok: true, html, status: response.status, attempts: attempt };
      }

      lastError = `HTTP ${response.status}`;

    } catch (err) {
      lastError = err instanceof Error ? err.message : "Fetch failed";
    }

    if (attempt < maxAttempts) {
      await wait(600 * attempt);
    }
  }

  return {
    ok: false,
    error:
      lastStatus === 403
        ? `${lastError} after ${maxAttempts} attempts (site is blocking automated checks, but remains monitored)`
        : `${lastError} after ${maxAttempts} attempts`,
    status: lastStatus,
    attempts: maxAttempts,
  };
}
