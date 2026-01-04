import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkVerificationTokens() {
  try {
    console.log('🔍 Checking Verification Tokens in Database\n');

    // Get all verification tokens
    const tokens = await prisma.verificationToken.findMany({
      orderBy: { expires: 'desc' },
    });

    console.log(`Found ${tokens.length} verification token(s):\n`);

    if (tokens.length === 0) {
      console.log('❌ No verification tokens found in database.');
      console.log('\nThis means:');
      console.log('  - No user has signed up yet, OR');
      console.log('  - Tokens were already deleted after verification, OR');
      console.log('  - Tokens expired and were cleaned up\n');
      return;
    }

    tokens.forEach((token: any, index: number) => {
      const isExpired = new Date(token.expires) < new Date();
      console.log(`Token #${index + 1}:`);
      console.log(`  Identifier (Email): ${token.identifier}`);
      console.log(`  Token: ${token.token.substring(0, 20)}...`);
      console.log(`  Expires: ${token.expires}`);
      console.log(`  Status: ${isExpired ? '❌ EXPIRED' : '✅ Valid'}`);
      console.log('');
    });

    // Check if there are any valid tokens
    const validTokens = tokens.filter((token: any) => new Date(token.expires) > new Date());
    console.log(`\nSummary: ${validTokens.length} valid token(s), ${tokens.length - validTokens.length} expired token(s)`);

    // Check for users with emailVerified status
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        isActive: true,
      },
    });

    console.log('\n👥 Users in Database:\n');
    users.forEach((user: any) => {
      const isVerified = user.emailVerified !== null;
      console.log(`  ${user.name} (${user.email})`);
      console.log(`    Email Verified: ${isVerified ? '✅ Yes' : '❌ No'}`);
      console.log(`    Active: ${user.isActive ? '✅ Yes' : '❌ No'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error checking verification tokens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVerificationTokens();
