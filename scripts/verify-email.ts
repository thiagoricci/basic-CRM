import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyUserEmail() {
  const email = process.argv[2];

  if (!email) {
    console.log('Usage: npx tsx scripts/verify-email.ts <email-address>');
    console.log('\nExample: npx tsx scripts/verify-email.ts thiago@reivien.com');
    return;
  }

  try {
    console.log(`Verifying email: ${email}\n`);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    if (user.emailVerified) {
      console.log('✅ Email is already verified!');
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    console.log('✅ Email verified successfully!');
    console.log(`\nUser: ${user.name} (${user.email})`);
    console.log(`Role: ${user.role}`);
    console.log(`Active: ${user.isActive ? 'Yes' : 'No'}`);
    console.log('\nYou can now sign in with this account.');

  } catch (error) {
    console.error('❌ Error verifying email:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUserEmail();
