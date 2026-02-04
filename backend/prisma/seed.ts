import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const kt1 = await prisma.plant.upsert({
    where: { name: 'KT1' },
    update: {},
    create: { name: 'KT1' },
  });
  const kt2 = await prisma.plant.upsert({
    where: { name: 'KT2' },
    update: {},
    create: { name: 'KT2' },
  });

  const deptA = await prisma.department.upsert({
    where: { name: 'Mechanical' },
    update: {},
    create: { name: 'Mechanical', plantId: kt1.id },
  });
  const deptB = await prisma.department.upsert({
    where: { name: 'Electrical' },
    update: {},
    create: { name: 'Electrical', plantId: kt2.id },
  });

  const password = await bcrypt.hash('password', 10);

  const users = [
    { email: 'requester@example.com', name: 'Requester', role: Role.REQUESTER, plantId: kt1.id, departmentId: deptA.id },
    { email: 'deptmanager@example.com', name: 'Dept Manager', role: Role.DEPT_MANAGER, plantId: kt1.id, departmentId: deptA.id },
    { email: 'plantmanager@example.com', name: 'Plant Manager', role: Role.PLANT_MANAGER, plantId: kt1.id },
    { email: 'purchmanager@example.com', name: 'Purch Manager', role: Role.PURCH_MANAGER, plantId: kt1.id },
    { email: 'buyer@example.com', name: 'Buyer', role: Role.BUYER, plantId: kt1.id },
    { email: 'admin@example.com', name: 'Admin', role: Role.ADMIN, plantId: kt1.id },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, password },
    });
  }

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
