type InviteOptions = {
  fullName: string;
  email: string | null;
  phone: string;
  loginUrl: string;
  password?: string;
};

const TEMP_PASSWORDS = [
  "eagle",
  "maple",
  "river",
  "cabin",
  "cedar",
  "sunny",
  "brave",
  "north",
  "barrel",
  "bottle",
  "amber",
  "forest",
];

export function generateTemporaryPassword(): string {
  const bytes = new Uint8Array(1);
  crypto.getRandomValues(bytes);
  return TEMP_PASSWORDS[bytes[0] % TEMP_PASSWORDS.length];
}

function currentLoginUrl(fallback: string): string {
  if (typeof window === "undefined") return fallback;
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return fallback;
  }
  return `${window.location.origin}/login`;
}

function normalizeSmsPhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export function buildInviteMessage({
  fullName,
  loginUrl,
  password,
}: InviteOptions): string {
  const firstName = fullName.trim().split(/\s+/)[0] || "there";
  const lines = [
    `Hi ${firstName}, I set up your Blanton's Watch profile.`,
    `Login: ${currentLoginUrl(loginUrl)}`,
  ];

  if (password) lines.push(`Password: ${password}`);

  return lines.join("\n");
}

export function buildSmsHref(options: InviteOptions): string {
  const phone = normalizeSmsPhone(options.phone);
  const body = encodeURIComponent(buildInviteMessage(options));
  const separator =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent)
      ? "&"
      : "?";

  return `sms:${phone}${separator}body=${body}`;
}
