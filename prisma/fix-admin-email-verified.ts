import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing admin user email verification...');

  // Update admin user to have emailVerified set
  const updatedUser = await prisma.user.update({
    where: { email: 'admin@crm.com' },
    data: {
      emailVerified: new Date(), // Set email verification to now
    },
  });

  console.log('Admin user updated:', {
    id: updatedUser.id,
    email: updatedUser.email,
    emailVerified: updatedUser.emailVerified,
    isActive: updatedUser.isActive,
  });

  console.log('✅ Admin user email verification fixed!');
}

main()
  .catch((e) => {
    console.error('Error fixing admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
