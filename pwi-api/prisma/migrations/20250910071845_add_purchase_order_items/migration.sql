-- AlterTable
ALTER TABLE "public"."PurchaseOrder" ADD COLUMN     "requestId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."PurchaseRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
