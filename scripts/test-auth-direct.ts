import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testAuthDirect() {
  try {
    console.log('🧪 Testing Authentication Directly\n');
    console.log('='.repeat(60));

    const email = 'admin@crm.com';
    const password = 'admin123';

    console.log(`\n📧 Email: ${email}`);
    console.log(`🔐 Password: ${password}\n`);

    // Step 1: Find user
    console.log('Step 1: Finding user...');
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   isActive: ${user.isActive}`);
    console.log(`   emailVerified: ${user.emailVerified}`);
    console.log(`   twoFactorEnabled: ${user.twoFactorEnabled}`);

    // Step 2: Test password
    console.log('\nStep 2: Testing password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`   Password valid: ${isPasswordValid}`);

    if (!isPasswordValid) {
      console.log('❌ Password does not match');
      return;
    }

    console.log('✅ Password matches');

    // Step 3: Check all conditions
    console.log('\nStep 3: Checking all login conditions...');

    const checks = {
      userExists: !!user,
      isActive: user.isActive === true,
      emailVerified: user.emailVerified !== null && user.emailVerified !== undefined,
      passwordValid: isPasswordValid,
      twoFactorEnabled: user.twoFactorEnabled === true,
    };

    console.log('\nLogin Requirements:');
    console.log(`  User exists: ${checks.userExists ? '✅' : '❌'}`);
    console.log(`  User active: ${checks.isActive ? '✅' : '❌'}`);
    console.log(`  Email verified: ${checks.emailVerified ? '✅' : '❌'}`);
    console.log(`  Password valid: ${checks.passwordValid ? '✅' : '❌'}`);
    console.log(`  2FA enabled: ${checks.twoFactorEnabled ? '⚠️' : '✅'}`);

    const canLogin = checks.userExists && checks.isActive && checks.emailVerified && checks.passwordValid;

    console.log('\n' + '='.repeat(60));
    if (canLogin) {
      console.log('✅ ALL CHECKS PASSED - User should be able to login');
      console.log('\nIf login still fails, the issue is likely:');
      console.log('  1. NextAuth session creation (check NEXTAUTH_SECRET)');
      console.log('  2. Browser cookies (try clearing them)');
      console.log('  3. Network/CORS issues');
      console.log('  4. Sign-in form not calling NextAuth correctly');
    } else {
      console.log('❌ LOGIN BLOCKED - One or more checks failed');
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthDirect();
