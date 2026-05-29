-- AlterTable
ALTER TABLE "User" ADD COLUMN "disabledAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
