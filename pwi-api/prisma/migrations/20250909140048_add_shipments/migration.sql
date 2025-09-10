-- CreateTable
CREATE TABLE "public"."Shipment" (
    "id" SERIAL NOT NULL,
    "soId" INTEGER NOT NULL,
    "warehouseId" INTEGER,
    "sjNo" TEXT,
    "shippedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShipmentItem" (
    "id" SERIAL NOT NULL,
    "shipmentId" INTEGER NOT NULL,
    "salesOrderItemId" INTEGER NOT NULL,
    "stockId" INTEGER NOT NULL,
    "qty" DECIMAL(14,3) NOT NULL,

    CONSTRAINT "ShipmentItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_sjNo_key" ON "public"."Shipment"("sjNo");

-- CreateIndex
CREATE INDEX "Shipment_soId_idx" ON "public"."Shipment"("soId");

-- CreateIndex
CREATE INDEX "ShipmentItem_shipmentId_idx" ON "public"."ShipmentItem"("shipmentId");

-- CreateIndex
CREATE INDEX "ShipmentItem_salesOrderItemId_idx" ON "public"."ShipmentItem"("salesOrderItemId");

-- CreateIndex
CREATE INDEX "ShipmentItem_stockId_idx" ON "public"."ShipmentItem"("stockId");

-- AddForeignKey
ALTER TABLE "public"."Shipment" ADD CONSTRAINT "Shipment_soId_fkey" FOREIGN KEY ("soId") REFERENCES "public"."SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShipmentItem" ADD CONSTRAINT "ShipmentItem_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "public"."Shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShipmentItem" ADD CONSTRAINT "ShipmentItem_salesOrderItemId_fkey" FOREIGN KEY ("salesOrderItemId") REFERENCES "public"."SalesOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShipmentItem" ADD CONSTRAINT "ShipmentItem_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "public"."Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
