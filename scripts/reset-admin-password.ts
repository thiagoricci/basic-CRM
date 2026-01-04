import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    const email = 'admin@crm.com';
    const newPassword = 'admin123'; // Default password

    console.log(`Resetting password for ${email}...\n`);

    // Find admin user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ Admin user not found!');
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log('✅ Password reset successfully!');
    console.log(`\nEmail: ${email}`);
    console.log(`Password: ${newPassword}`);
    console.log('\nYou can now sign in with these credentials.');

  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
