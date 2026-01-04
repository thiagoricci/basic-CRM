import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function updateAdminPassword() {
  try {
    const email = 'admin@crm.com';
    const newPassword = 'testeTESTE123#';

    // Find admin user
    const admin = await (prisma as any).user.findUnique({
      where: { email },
    });

    if (!admin) {
      console.error('Admin user not found');
      process.exit(1);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await (prisma as any).user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log('✅ Admin password updated successfully');
    console.log(`Email: ${email}`);
    console.log(`New password: ${newPassword}`);
  } catch (error) {
    console.error('Error updating password:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();
