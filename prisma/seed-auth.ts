import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Check if admin user already exists
  // @ts-ignore - Prisma types not yet generated
  const existingAdmin = await (prisma as any).user.findUnique({
    where: { email: 'admin@crm.com' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    return;
  }

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // @ts-ignore - Prisma types not yet generated
  const admin = await (prisma as any).user.create({
    data: {
      email: 'admin@crm.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      isActive: true,
    },
  });

  console.log('Admin user created:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
