// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = [
    { email: 'staff@pwi.local',      name: 'Staff Sample',      level: 'STAFF',      password: 'password' },
    { email: 'sup@pwi.local',        name: 'Supervisor Sample', level: 'SUPERVISOR', password: 'password' },
    { email: 'manager@pwi.local',    name: 'Manager Sample',    level: 'MANAGER',    password: 'password' },
    { email: 'director@pwi.local',   name: 'Director Sample',   level: 'DIRECTOR',   password: 'password' },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      create: { email: u.email, name: u.name, level: u.level, passwordHash },
      update: { name: u.name, level: u.level, passwordHash },
    });
  }

  console.log('Seeded users.');
}

main().finally(() => prisma.$disconnect());
