import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function fixLoginIssue() {
  try {
    console.log('🔧 Fixing Login Issue\n');
    console.log('='.repeat(60));

    const email = 'admin@crm.com';
    const newPassword = 'admin123';

    console.log(`\n📧 Fixing user: ${email}\n`);

    // Step 1: Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ USER NOT FOUND');
      console.log('\n⚠️  The admin user does not exist in database.');
      console.log('\n💡 Solution: Run npm run seed-auth to create admin user');
      return;
    }

    console.log('✅ User found in database\n');

    // Step 2: Prepare fixes
    const updates: any = {};
    let fixCount = 0;

    // Check and fix isActive
    if (!user.isActive) {
      updates.isActive = true;
      fixCount++;
      console.log('🔧 Fixing: Setting isActive to true');
    } else {
      console.log('✅ isActive is already true');
    }

    // Check and fix emailVerified
    if (!user.emailVerified) {
      updates.emailVerified = new Date();
      fixCount++;
      console.log('🔧 Fixing: Setting emailVerified to current date');
    } else {
      console.log('✅ emailVerified is already set');
    }

    // Always reset password to be safe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    updates.password = hashedPassword;
    fixCount++;
    console.log('🔧 Fixing: Resetting password to "admin123"');

    // Step 3: Apply fixes
    if (fixCount > 0) {
      console.log('\n⏳ Applying fixes...\n');

      await prisma.user.update({
        where: { email },
        data: updates,
      });

      console.log('✅ All fixes applied successfully!\n');
    } else {
      console.log('\nℹ️  No fixes needed. User is already properly configured.\n');
    }

    // Step 4: Verify fixes
    console.log('Verifying fixes...\n');

    const updatedUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        emailVerified: true,
        twoFactorEnabled: true,
      },
    });

    if (!updatedUser) {
      console.log('❌ Error: User not found after update');
      return;
    }

    console.log('Updated User Details:');
    console.log(`  ID: ${updatedUser.id}`);
    console.log(`  Name: ${updatedUser.name}`);
    console.log(`  Email: ${updatedUser.email}`);
    console.log(`  Role: ${updatedUser.role}`);
    console.log(`  Active: ${updatedUser.isActive ? '✅ Yes' : '❌ No'}`);
    console.log(`  Email Verified: ${updatedUser.emailVerified ? '✅ Yes' : '❌ No'}`);
    console.log(`  2FA Enabled: ${updatedUser.twoFactorEnabled ? '✅ Yes' : '❌ No'}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ LOGIN FIX COMPLETE\n');
    console.log('You can now sign in with:');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${newPassword}`);
    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ Error fixing login issue:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixLoginIssue();
