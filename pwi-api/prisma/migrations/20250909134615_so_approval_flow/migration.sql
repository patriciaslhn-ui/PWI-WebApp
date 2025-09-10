-- CreateEnum
CREATE TYPE "public"."SOApproval" AS ENUM ('AUTO_APPROVED', 'WAITING_MANAGER', 'WAITING_DIRECTOR', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."SalesOrder" ADD COLUMN     "approvalStatus" "public"."SOApproval" NOT NULL DEFAULT 'AUTO_APPROVED',
ADD COLUMN     "approvedDirectorAt" TIMESTAMP(3),
ADD COLUMN     "approvedManagerAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "SalesOrder_approvalStatus_idx" ON "public"."SalesOrder"("approvalStatus");
