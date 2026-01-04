import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get admin user
  // @ts-ignore - Prisma types not yet generated
  const admin = await (prisma as any).user.findUnique({
    where: { email: 'admin@crm.com' },
  });

  if (!admin) {
    console.log('Admin user not found. Please run seed-auth.ts first.');
    return;
  }

  // Assign all contacts to admin
  // @ts-ignore - Prisma types not yet generated
  const contacts = await (prisma as any).contact.updateMany({
    where: { userId: null },
    data: { userId: admin.id },
  });

  console.log(`Assigned ${contacts.count} contacts to admin`);

  // Assign all deals to admin
  // @ts-ignore - Prisma types not yet generated
  const deals = await (prisma as any).deal.updateMany({
    where: { userId: null },
    data: { userId: admin.id },
  });

  console.log(`Assigned ${deals.count} deals to admin`);

  // Assign all tasks to admin
  // @ts-ignore - Prisma types not yet generated
  const tasks = await (prisma as any).task.updateMany({
    where: { userId: null },
    data: { userId: admin.id },
  });

  console.log(`Assigned ${tasks.count} tasks to admin`);

  // Assign all activities to admin
  // @ts-ignore - Prisma types not yet generated
  const activities = await (prisma as any).activity.updateMany({
    where: { userId: null },
    data: { userId: admin.id },
  });

  console.log(`Assigned ${activities.count} activities to admin`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
