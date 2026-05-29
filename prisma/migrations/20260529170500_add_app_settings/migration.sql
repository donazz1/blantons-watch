-- CreateTable
CREATE TABLE "AppSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);

-- Seed default scrape schedule to every 4 hours.
INSERT INTO "AppSetting" ("key", "value", "updatedAt")
VALUES ('scrape.scheduleMinutes', '240', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
