import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function diagnoseLoginIssue() {
  try {
    console.log('🔍 Diagnosing Login Issue\n');
    console.log('='.repeat(60));

    const email = 'admin@crm.com';
    const testPassword = 'admin123';

    console.log(`\n📧 Checking user: ${email}\n`);

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
    console.log('User Details:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`\nStatus Checks:`);

    // Step 2: Check isActive
    const isActive = user.isActive === true;
    console.log(`  Active: ${isActive ? '✅ Yes' : '❌ NO - User is inactive'}`);

    if (!isActive) {
      console.log('\n⚠️  ISSUE FOUND: User is inactive');
      console.log('   Inactive users cannot sign in.');
      console.log('\n💡 Solution: Set isActive to true in database');
    }

    // Step 3: Check emailVerified
    const isEmailVerified = user.emailVerified !== null && user.emailVerified !== undefined;
    console.log(`  Email Verified: ${isEmailVerified ? '✅ Yes' : '❌ NO - Email not verified'}`);

    if (!isEmailVerified) {
      console.log('\n⚠️  ISSUE FOUND: Email not verified');
      console.log('   Unverified users cannot sign in.');
      console.log('\n💡 Solution: Set emailVerified to current date in database');
    }

    // Step 4: Check 2FA
    const has2FA = user.twoFactorEnabled === true;
    console.log(`  2FA Enabled: ${has2FA ? '✅ Yes' : '❌ No'}`);

    if (has2FA) {
      console.log('\nℹ️  INFO: 2FA is enabled');
      console.log('   User must complete 2FA verification after password check');
    }

    // Step 5: Test password
    console.log(`\n🔐 Testing password: "${testPassword}"`);

    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    console.log(`  Password Match: ${isPasswordValid ? '✅ Yes' : '❌ NO - Password does not match'}`);

    if (!isPasswordValid) {
      console.log('\n⚠️  ISSUE FOUND: Password does not match');
      console.log('   The password hash in the database does not match "admin123"');
      console.log('\n💡 Solution: Reset password to admin123 using fix script');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 DIAGNOSIS SUMMARY\n');

    const issues = [];

    if (!isActive) issues.push('User is inactive');
    if (!isEmailVerified) issues.push('Email is not verified');
    if (!isPasswordValid) issues.push('Password does not match');

    if (issues.length === 0) {
      console.log('✅ No issues found!');
      console.log('\nIf you still cannot login, issue may be:');
      console.log('  1. Browser cache/cookies - Try clearing them');
      console.log('  2. Rate limiting - Wait and try again');
      console.log('  3. Network issues - Check your connection');
      console.log('  4. NextAuth configuration - Check NEXTAUTH_SECRET and NEXTAUTH_URL');
    } else {
      console.log('❌ Found the following issue(s):\n');
      issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });

      console.log('\n💡 Run fix script to resolve all issues:');
      console.log('   npm run fix-login');
    }

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseLoginIssue();
