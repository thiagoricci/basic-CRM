import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteUser() {
  try {
    console.log('🔧 Deleting user from database...\n');

    // Get user email from command line argument or use default
    const email = process.argv[2] || 'admin@crm.com';
    console.log(`Looking for user with email: ${email}\n`);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      console.log('No user to delete.');
      process.exit(0);
    }

    console.log('User found:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Created: ${user.createdAt}\n`);

    // Confirm deletion
    console.log('⚠️  WARNING: This will permanently delete the user and all associated data!');
    console.log('  - User account');
    console.log('  - All contacts');
    console.log('  - All deals');
    console.log('  - All tasks');
    console.log('  - All activities');
    console.log('  - All sign-in history');
    console.log('  - All 2FA backup codes\n');

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: user.id },
    });

    console.log('✅ User deleted successfully!\n');
    console.log('You can now create a new account with the same email address.\n');
    console.log('Next steps:');
    console.log('  1. Go to: http://localhost:3000/auth/signup');
    console.log('  2. Create a new account');
    console.log('  3. Verify your email address');
    console.log('  4. Sign in with your new account\n');

  } catch (error) {
    console.error('\n❌ Error deleting user!\n');
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
deleteUser();
