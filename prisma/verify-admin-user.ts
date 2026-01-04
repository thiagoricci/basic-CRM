import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function verifyAdminUser() {
  try {
    const email = 'admin@crm.com';

    // Find admin user
    const admin = await (prisma as any).user.findUnique({
      where: { email },
    });

    if (!admin) {
      console.error('Admin user not found');
      process.exit(1);
    }

    console.log('Admin user found:');
    console.log('- ID:', admin.id);
    console.log('- Email:', admin.email);
    console.log('- Name:', admin.name);
    console.log('- Role:', admin.role);
    console.log('- Active:', admin.isActive);
    console.log('- Password hash:', admin.password.substring(0, 20) + '...');

    // Test password verification
    const testPassword = 'testeTESTE123#';
    const isValid = await bcrypt.compare(testPassword, admin.password);
    console.log('\nPassword verification:');
    console.log('- Test password:', testPassword);
    console.log('- Is valid:', isValid);

    if (!isValid) {
      console.log('\n❌ Password verification failed!');
      console.log('The password in database does not match "testeTESTE123#"');
    } else {
      console.log('\n✅ Password verification successful!');
    }
  } catch (error) {
    console.error('Error verifying user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdminUser();
