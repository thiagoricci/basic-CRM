import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Load environment variables
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

// Generate verification token
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function testSignupFlow() {
  try {
    console.log('🧪 Testing Signup Flow\n');

    const testEmail = 'test@example.com';
    const testName = 'Test User';
    const testPassword = 'testpassword123';

    console.log('Step 1: Creating user...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    // Create user
    const user = await (prisma as any).user.create({
      data: {
        name: testName,
        email: testEmail.toLowerCase(),
        password: hashedPassword,
        role: 'rep',
        isActive: true,
        emailVerified: null,
      },
    });

    console.log(`✅ User created: ${user.name} (${user.email})`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Email Verified: ${user.emailVerified}\n`);

    console.log('Step 2: Generating verification token...');
    
    // Generate verification token
    const verificationToken = generateVerificationToken();
    console.log(`✅ Token generated: ${verificationToken.substring(0, 20)}...\n`);

    console.log('Step 3: Storing verification token in database...');
    
    // Store verification token
    const tokenRecord = await (prisma as any).verificationToken.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    console.log(`✅ Token stored in database`);
    console.log(`   Identifier: ${tokenRecord.identifier}`);
    console.log(`   Token: ${tokenRecord.token.substring(0, 20)}...`);
    console.log(`   Expires: ${tokenRecord.expires}\n`);

    console.log('Step 4: Verifying token can be found...');
    
    // Try to find the token
    const foundToken = await (prisma as any).verificationToken.findUnique({
      where: { token: verificationToken },
    });

    if (foundToken) {
      console.log(`✅ Token found in database!`);
      console.log(`   Identifier: ${foundToken.identifier}`);
      console.log(`   Token: ${foundToken.token.substring(0, 20)}...`);
      console.log(`   Expires: ${foundToken.expires}`);
    } else {
      console.log(`❌ Token NOT found in database!`);
    }

    console.log('\n✨ Signup flow test complete!');
    console.log('\nYou can now test the verification API with:');
    console.log(`http://localhost:3000/api/auth/verify-email?token=${verificationToken}`);

  } catch (error) {
    console.error('❌ Error testing signup flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSignupFlow();
