-- CreateTable
CREATE TABLE "public"."SalesAllocation" (
    "id" SERIAL NOT NULL,
    "salesOrderItemId" INTEGER NOT NULL,
    "stockId" INTEGER NOT NULL,
    "qty" DECIMAL(14,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SalesAllocation_salesOrderItemId_idx" ON "public"."SalesAllocation"("salesOrderItemId");

-- CreateIndex
CREATE INDEX "SalesAllocation_stockId_idx" ON "public"."SalesAllocation"("stockId");

-- CreateIndex
CREATE INDEX "Stock_receivedAt_idx" ON "public"."Stock"("receivedAt");

-- AddForeignKey
ALTER TABLE "public"."SalesAllocation" ADD CONSTRAINT "SalesAllocation_salesOrderItemId_fkey" FOREIGN KEY ("salesOrderItemId") REFERENCES "public"."SalesOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesAllocation" ADD CONSTRAINT "SalesAllocation_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "public"."Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
