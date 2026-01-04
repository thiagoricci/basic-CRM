import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('🗑️  Clearing Database...\n');

    // Delete all verification tokens
    const deletedTokens = await (prisma as any).verificationToken.deleteMany({});
    console.log(`✅ Deleted ${deletedTokens.count} verification token(s)`);

    // Delete all users (except admin if you want to keep it)
    // Uncomment the line below if you want to keep the admin user
    // await (prisma as any).user.deleteMany({ where: { email: { not: 'admin@crm.com' } } });

    // Delete all users (including admin)
    const deletedUsers = await (prisma as any).user.deleteMany({});
    console.log(`✅ Deleted ${deletedUsers.count} user(s)`);

    // Note: Contacts, activities, tasks, deals will remain
    // They have cascade delete set but won't be deleted since we're deleting users
    // If you want to clear everything, uncomment the lines below:

    /*
    await prisma.contact.deleteMany({});
    console.log('✅ Deleted all contacts');

    await prisma.activity.deleteMany({});
    console.log('✅ Deleted all activities');

    await prisma.task.deleteMany({});
    console.log('✅ Deleted all tasks');

    await prisma.deal.deleteMany({});
    console.log('✅ Deleted all deals');

    await prisma.company.deleteMany({});
    console.log('✅ Deleted all companies');
    */

    console.log('\n✨ Database cleared successfully!');
    console.log('\nYou can now:');
    console.log('  1. Sign up with your email address');
    console.log('  2. Receive a fresh verification email');
    console.log('  3. Click the verification link');
    console.log('  4. Sign in with your verified account\n');

  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
