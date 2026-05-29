import { prisma } from "@/lib/db";
import { STORE_SEEDS } from "@/lib/stores-config";

export async function ensureStoresSeeded() {
  const activeSlugs = STORE_SEEDS.map((seed) => seed.slug);

  await prisma.monitorStore.updateMany({
    where: { slug: { notIn: activeSlugs } },
    data: { enabled: false },
  });

  for (const seed of STORE_SEEDS) {
    await prisma.monitorStore.upsert({
      where: { slug: seed.slug },
      create: seed,
      update: {
        name: seed.name,
        productName: seed.productName,
        url: seed.url,
        region: seed.region,
        enabled: true,
      },
    });
  }
}

export async function ensureAdminUser() {
  const existing = await prisma.user.findFirst({ where: { isAdmin: true } });
  if (existing) {
    if (existing.fullName === "Admin") {
      return prisma.user.update({
        where: { id: existing.id },
        data: { fullName: "Don" },
      });
    }
    return existing;
  }

  return prisma.user.create({
    data: {
      fullName: "Don",
      phone: process.env.ADMIN_PHONE ?? "0000000000",
      email: process.env.ADMIN_EMAIL?.trim() || null,
      isAdmin: true,
    },
  });
}

export async function bootstrapDatabase() {
  await ensureStoresSeeded();
  await ensureAdminUser();
}
