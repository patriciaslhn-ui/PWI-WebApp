import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear tables in correct order (to avoid FK errors)
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.purchaseRequestItem.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.item.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const manufacturingStaff = await prisma.user.create({
    data: {
      email: 'mfstaff@example.com',
      name: 'Manufacturing Staff',
      level: 'STAFF',
      passwordHash: '123456', // replace with bcrypt hash later
    },
  });

  const purchasingStaff = await prisma.user.create({
    data: {
      email: 'purchasing@example.com',
      name: 'Purchasing Staff',
      level: 'SUPERVISOR',
      passwordHash: '123456',
    },
  });

  const director = await prisma.user.create({
    data: {
      email: 'director@example.com',
      name: 'Company Director',
      level: 'DIRECTOR',
      passwordHash: '123456',
    },
  });

  // Supplier
  const supplier = await prisma.supplier.create({
    data: {
      name: 'ABC Raw Materials',
      address: 'Jl. Raya No. 1',
      phone: '+62 812 3456 7890',
      email: 'supplier@example.com',
    },
  });

  // Items
  const ethanol = await prisma.item.create({
    data: {
      sku: 'RM-ETHANOL',
      name: 'Ethanol',
      type: 'RM',
      uom: 'L',
      unitPrice: 20000,
      safetyStock: 100,
    },
  });

  const bottle = await prisma.item.create({
    data: {
      sku: 'PK-BOTTLE100',
      name: 'Bottle 100ml',
      type: 'PACKAGING',
      uom: 'PCS',
      unitPrice: 3000,
      safetyStock: 500,
    },
  });

  const perfume = await prisma.item.create({
    data: {
      sku: 'FG-PERFUME01',
      name: 'Perfume 100ml',
      type: 'FG',
      uom: 'PCS',
      unitPrice: 150000,
      safetyStock: 50,
    },
  });

  // Example Purchase Request (from Manufacturing staff)
  const pr = await prisma.purchaseRequest.create({
    data: {
      prNo: `PR-${Date.now()}`,
      orderingDate: new Date(),
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Need ethanol and bottles for next batch',
      requestedById: manufacturingStaff.id,
      status: 'CREATED',
      items: {
        create: [
          { productId: ethanol.id, qty: 200, uom: 'L' },
          { productId: bottle.id, qty: 500, uom: 'PCS' },
        ],
      },
    },
    include: { items: true },
  });

  // Example Purchase Order (linked to PR, created by Purchasing staff)
  await prisma.purchaseOrder.create({
    data: {
      poNo: `PO-${Date.now()}`,
      orderingDate: pr.orderingDate,
      deliveryDate: pr.deliveryDate,
      notes: pr.notes,
      supplierId: supplier.id,
      requestId: pr.id,
      status: 'CREATED',
      items: {
        create: [
          { productId: ethanol.id, qty: 200, uom: 'L', price: 18000 },
          { productId: bottle.id, qty: 500, uom: 'PCS', price: 2500 },
        ],
      },
    },
  });

  console.log('✅ Seed completed successfully');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

