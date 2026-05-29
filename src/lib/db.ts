import { PrismaClient } from "@prisma/client";

/** Local SQLite paths were relative to project root; hosted Postgres URLs pass through. */
function resolveDatabaseUrl(): void {
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith("file:")) return;

  const filePath = url.replace(/^file:/, "");
  if (filePath.startsWith("/")) return;

  const absolute = `${process.cwd()}/${filePath.replace(/^\.\//, "")}`;
  process.env.DATABASE_URL = `file:${absolute}`;
}

resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
