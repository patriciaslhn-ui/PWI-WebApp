import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.purchaseRequestItem.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.item.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.userDivision.deleteMany();
  await prisma.user.deleteMany();

  const hashed = await bcrypt.hash('123456', 10);

  // Manufacturing Staff
  await prisma.user.create({
    data: {
      email: 'mfstaff@example.com',
      name: 'Manufacturing Staff',
      level: 'STAFF',
      passwordHash: hashed,
      divisions: { create: [{ division: 'MANUFACTURING' }] },
    },
  });

  // Purchasing Staff
  await prisma.user.create({
    data: {
      email: 'purchasing@example.com',
      name: 'Purchasing Staff',
      level: 'SUPERVISOR',
      passwordHash: 'password',
      divisions: { create: [{ division: 'PURCHASING' }] },
    },
  });

  // Director
  await prisma.user.create({
    data: {
      email: 'director@example.com',
      name: 'Company Director',
      level: 'DIRECTOR',
      passwordHash: hashed,
      divisions: {
        create: [
          { division: 'MANUFACTURING' },
          { division: 'PURCHASING' },
          { division: 'SALES' },
        ],
      },
    },
  });

  // Supplier
  await prisma.supplier.create({
    data: {
      name: 'ABC Raw Materials',
      email: 'supplier@example.com',
      phone: '+62 812 3456 7890',
    },
  });

  // Items
  await prisma.item.createMany({
    data: [
      { sku: 'RM-ETHANOL', name: 'Ethanol', type: 'RM', uom: 'L', unitPrice: 20000, safetyStock: 100 },
      { sku: 'PK-BOTTLE100', name: 'Bottle 100ml', type: 'PACKAGING', uom: 'PCS', unitPrice: 3000, safetyStock: 500 },
      { sku: 'FG-PERFUME01', name: 'Perfume 100ml', type: 'FG', uom: 'PCS', unitPrice: 150000, safetyStock: 50 },
    ],
  });

  console.log('✅ Seed complete');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
