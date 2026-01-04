import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Checking users in database...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    });

    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('\nYou need to create an admin user first.');
      console.log('Run: npm run seed-auth');
      return;
    }

    console.log(`✅ Found ${users.length} user(s):\n`);

    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Active: ${user.isActive ? '✅ Yes' : '❌ No'}`);
      console.log(`  Email Verified: ${user.emailVerified ? '✅ Yes' : '❌ No'}`);
      console.log(`  2FA Enabled: ${user.twoFactorEnabled ? '✅ Yes' : '❌ No'}`);
      console.log(`  Created: ${user.createdAt.toISOString()}`);
      console.log('');
    });

    // Check for potential issues
    const inactiveUsers = users.filter(u => !u.isActive);
    if (inactiveUsers.length > 0) {
      console.log('⚠️  WARNING: Some users are inactive and cannot sign in.');
    }

    const unverifiedUsers = users.filter(u => !u.emailVerified);
    if (unverifiedUsers.length > 0) {
      console.log('⚠️  WARNING: Some users have not verified their email.');
      console.log('   Unverified users cannot sign in.');
    }

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
