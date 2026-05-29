-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK', 'UNKNOWN', 'ERROR');

-- CreateEnum
CREATE TYPE "HitOutcomeType" AS ENUM ('PURCHASED', 'NOT_AVAILABLE', 'IN_STOCK_NOT_PURCHASED');

-- AlterTable
ALTER TABLE "StockCheck"
ALTER COLUMN "status" TYPE "StockStatus"
USING "status"::"StockStatus";

-- AlterTable
ALTER TABLE "HitOutcome"
ALTER COLUMN "outcome" TYPE "HitOutcomeType"
USING "outcome"::"HitOutcomeType";
