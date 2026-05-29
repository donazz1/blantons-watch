-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "photoUrl" TEXT,
    "accessToken" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "MonitorStore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "StockCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "detail" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockCheck_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "MonitorStore" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Hit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "notifiedAt" TIMESTAMP(3),
    CONSTRAINT "Hit_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "MonitorStore" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HitOutcome" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HitOutcome_hitId_fkey" FOREIGN KEY ("hitId") REFERENCES "Hit" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HitOutcome_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AlertLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hitId" TEXT,
    "message" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_accessToken_key" ON "User"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "MonitorStore_slug_key" ON "MonitorStore"("slug");

-- CreateIndex
CREATE INDEX "StockCheck_storeId_checkedAt_idx" ON "StockCheck"("storeId", "checkedAt");

-- CreateIndex
CREATE INDEX "Hit_detectedAt_idx" ON "Hit"("detectedAt");

-- CreateIndex
CREATE UNIQUE INDEX "HitOutcome_hitId_userId_key" ON "HitOutcome"("hitId", "userId");
