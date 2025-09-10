-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'SALES', 'MANUFACTURING', 'PURCHASING', 'RM_WAREHOUSE', 'FG_WAREHOUSE', 'LOGISTICS', 'FAT');

-- CreateEnum
CREATE TYPE "public"."ItemType" AS ENUM ('FG', 'RM', 'PACKAGING');

-- CreateEnum
CREATE TYPE "public"."SalesOrderStatus" AS ENUM ('CREATED', 'PENDING', 'PARTIALLY_SHIPPED', 'FULLY_SHIPPED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'SALES',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "creditTermsDays" INTEGER DEFAULT 0,
    "outstandingBalance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Item" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."ItemType" NOT NULL,
    "uom" TEXT,
    "unitPrice" DECIMAL(14,2),
    "safetyStock" DECIMAL(14,3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Bom" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "componentId" INTEGER NOT NULL,
    "qtyPerProduct" DECIMAL(14,3) NOT NULL,

    CONSTRAINT "Bom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Warehouse" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Stock" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "batchNo" TEXT,
    "qtyOnHand" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "qtyReserved" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "receivedAt" TIMESTAMP(3),
    "expiry" TIMESTAMP(3),
    "unitCost" DECIMAL(14,2),

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SalesOrder" (
    "id" SERIAL NOT NULL,
    "soNo" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "status" "public"."SalesOrderStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SalesOrderItem" (
    "id" SERIAL NOT NULL,
    "salesOrderId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "qtyOrdered" DECIMAL(14,3) NOT NULL,
    "qtyFulfilled" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "unitPrice" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "SalesOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StockMovement" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemId" INTEGER NOT NULL,
    "batchNo" TEXT,
    "fromWhId" INTEGER,
    "toWhId" INTEGER,
    "qty" DECIMAL(14,3) NOT NULL,
    "movementType" TEXT NOT NULL,
    "relatedDoc" TEXT,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Item_sku_key" ON "public"."Item"("sku");

-- CreateIndex
CREATE INDEX "Bom_productId_idx" ON "public"."Bom"("productId");

-- CreateIndex
CREATE INDEX "Bom_componentId_idx" ON "public"."Bom"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_name_key" ON "public"."Warehouse"("name");

-- CreateIndex
CREATE INDEX "Stock_itemId_idx" ON "public"."Stock"("itemId");

-- CreateIndex
CREATE INDEX "Stock_warehouseId_idx" ON "public"."Stock"("warehouseId");

-- CreateIndex
CREATE INDEX "Stock_batchNo_idx" ON "public"."Stock"("batchNo");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_soNo_key" ON "public"."SalesOrder"("soNo");

-- CreateIndex
CREATE INDEX "SalesOrder_customerId_idx" ON "public"."SalesOrder"("customerId");

-- CreateIndex
CREATE INDEX "SalesOrderItem_salesOrderId_idx" ON "public"."SalesOrderItem"("salesOrderId");

-- CreateIndex
CREATE INDEX "SalesOrderItem_itemId_idx" ON "public"."SalesOrderItem"("itemId");

-- CreateIndex
CREATE INDEX "StockMovement_itemId_idx" ON "public"."StockMovement"("itemId");

-- CreateIndex
CREATE INDEX "StockMovement_batchNo_idx" ON "public"."StockMovement"("batchNo");

-- CreateIndex
CREATE INDEX "StockMovement_createdAt_idx" ON "public"."StockMovement"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Bom" ADD CONSTRAINT "Bom_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bom" ADD CONSTRAINT "Bom_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "public"."Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Stock" ADD CONSTRAINT "Stock_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Stock" ADD CONSTRAINT "Stock_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesOrder" ADD CONSTRAINT "SalesOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "public"."SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
