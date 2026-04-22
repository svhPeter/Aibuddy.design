-- CreateEnum
CREATE TYPE "BillingPlan" AS ENUM ('free', 'pro');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "plan" "BillingPlan" NOT NULL DEFAULT 'free',
ADD COLUMN     "pro_ai_quota_monthly" INTEGER NOT NULL DEFAULT 50000;

-- CreateTable
CREATE TABLE "user_monthly_usage" (
    "profile_id" UUID NOT NULL,
    "year_month" TEXT NOT NULL,
    "utility_uses" INTEGER NOT NULL DEFAULT 0,
    "ai_uses" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_monthly_usage_pkey" PRIMARY KEY ("profile_id","year_month")
);

-- CreateTable
CREATE TABLE "guest_monthly_usage" (
    "guest_id" TEXT NOT NULL,
    "year_month" TEXT NOT NULL,
    "total_uses" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "guest_monthly_usage_pkey" PRIMARY KEY ("guest_id","year_month")
);

-- AddForeignKey
ALTER TABLE "user_monthly_usage" ADD CONSTRAINT "user_monthly_usage_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
