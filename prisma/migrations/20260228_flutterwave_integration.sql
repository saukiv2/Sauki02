-- Migration: Update User model for PIN-based auth and Flutterwave integration
-- Date: 2026-02-28
-- Description: Add firstName, lastName, PIN, BVN columns; update Wallet model for Flutterwave; add webhook log table

-- 1. Add columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pin" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bvn" TEXT;

-- 2. Migrate fullName to firstName and lastName (if fullName exists)
-- This script assumes your current fullName field exists and wants to split it
UPDATE "User" 
SET 
  "firstName" = SPLIT_PART("fullName", ' ', 1),
  "lastName" = SUBSTRING("fullName" FROM POSITION(' ' IN "fullName") + 1)
WHERE "firstName" IS NULL AND "fullName" IS NOT NULL;

-- Set default values for existing users (if needed)
UPDATE "User" 
SET "firstName" = 'User', "lastName" = 'Account'
WHERE "firstName" IS NULL;

-- Make firstName and lastName NOT NULL (but do this only after migration)
-- ALTER TABLE "User" ALTER COLUMN "firstName" SET NOT NULL;
-- ALTER TABLE "User" ALTER COLUMN "lastName" SET NOT NULL;

-- 3. Add columns to Wallet table for Flutterwave details
CREATE TABLE "FlutterwaveWebhookLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "txRef" TEXT NOT NULL UNIQUE,
  "flwRef" TEXT,
  "userId" TEXT,
  "walletId" TEXT,
  "amount" INTEGER NOT NULL,
  "status" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "rawPayload" JSONB NOT NULL,
  "processed" BOOLEAN NOT NULL DEFAULT false,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for webhook log table
CREATE INDEX "FlutterwaveWebhookLog_txRef_idx" ON "FlutterwaveWebhookLog"("txRef");
CREATE INDEX "FlutterwaveWebhookLog_userId_idx" ON "FlutterwaveWebhookLog"("userId");
CREATE INDEX "FlutterwaveWebhookLog_walletId_idx" ON "FlutterwaveWebhookLog"("walletId");
CREATE INDEX "FlutterwaveWebhookLog_status_idx" ON "FlutterwaveWebhookLog"("status");
CREATE INDEX "FlutterwaveWebhookLog_processed_idx" ON "FlutterwaveWebhookLog"("processed");

-- Verification queries (run these to verify migration)
-- SELECT COUNT(*) as total_users, COUNT("firstName") as users_with_firstName FROM "User";
-- SELECT COUNT(*) as total_wallets, COUNT("flwAccountNumber") as wallets_with_account FROM "Wallet";
-- SELECT COUNT(*) FROM "FlutterwaveWebhookLog";
