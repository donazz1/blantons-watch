import os from "node:os";

function getLanAddress(): string | null {
  const interfaces = os.networkInterfaces();

  for (const name of ["en0", "en1"]) {
    const match = interfaces[name]?.find(
      (item) => item.family === "IPv4" && !item.internal,
    );
    if (match) return match.address;
  }

  for (const items of Object.values(interfaces)) {
    const match = items?.find(
      (item) => item.family === "IPv4" && !item.internal,
    );
    if (match) return match.address;
  }

  return null;
}

export function getAppBaseUrl(): string {
  const configured = process.env.APP_BASE_URL ?? process.env.URL;
  if (configured) return configured.replace(/\/$/, "");

  const lanAddress = getLanAddress();
  if (lanAddress) return `http://${lanAddress}:3000`;

  return "http://localhost:3000";
}
