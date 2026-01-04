import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testSignInAPI() {
  try {
    console.log('🔌 Testing Sign-In API Logic\n');
    console.log('='.repeat(60));

    const email = 'admin@crm.com';
    const password = 'admin123';

    console.log(`\n📧 Email: ${email}`);
    console.log(`🔐 Password: ${password}\n`);

    // Simulate what the API does
    console.log('Step 1: Validating input...');
    if (!email || !password) {
      console.log('❌ Email and password are required');
      return;
    }
    console.log('✅ Input valid');

    console.log('\nStep 2: Finding user...');
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.log('❌ User not found');
      console.log('   Would return: "Invalid email or password"');
      return;
    }
    console.log('✅ User found');

    console.log('\nStep 3: Checking if user is active...');
    if (!user.isActive) {
      console.log('❌ User is inactive');
      console.log('   Would return: "Account is inactive. Please contact your administrator."');
      return;
    }
    console.log('✅ User is active');

    console.log('\nStep 4: Checking if email is verified...');
    if (!user.emailVerified) {
      console.log('❌ Email not verified');
      console.log('   Would return: "Please verify your email address before signing in."');
      return;
    }
    console.log('✅ Email is verified');

    console.log('\nStep 5: Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Password does not match');
      console.log('   Would return: "Invalid email or password"');
      return;
    }
    console.log('✅ Password is valid');

    console.log('\nStep 6: Checking for suspicious activity...');
    // Skipping this for now as it requires IP address

    console.log('\nStep 7: Returning success...');
    console.log('✅ Would return:');
    console.log(`   {`);
    console.log(`     data: {`);
    console.log(`       success: true,`);
    console.log(`       twoFactorEnabled: ${user.twoFactorEnabled},`);
    console.log(`       userId: "${user.id}"`);
    console.log(`     },`);
    console.log(`     error: null`);
    console.log(`   }`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ API LOGIC TEST PASSED');
    console.log('\nThe API should return success with these credentials.');
    console.log('If the frontend still shows error, check:');
    console.log('  1. Network tab in browser for actual API response');
    console.log('  2. Browser console for JavaScript errors');
    console.log('  3. Rate limiting (10 requests per hour per IP)');
    console.log('  4. CORS issues if running on different port');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSignInAPI();
