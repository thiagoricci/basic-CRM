import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPhoneUniqueness() {
  console.log('Testing Phone Number Uniqueness\n');
  console.log('='.repeat(50));

  // Test 1: Create contact with unique phone number
  console.log('\n[Test 1] Creating contact with unique phone number...');
  try {
    const contact1 = await prisma.contact.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe.test1@example.com',
        phoneNumber: '555-1234',
        status: 'lead',
      },
    });
    console.log('✓ Success: Created contact with phone number 555-1234');
    console.log(`  Contact ID: ${contact1.id}`);
  } catch (error: any) {
    console.log(`✗ Failed: ${error.message}`);
  }

  // Test 2: Create contact with duplicate phone number (should fail)
  console.log('\n[Test 2] Creating contact with duplicate phone number...');
  try {
    const contact2 = await prisma.contact.create({
      data: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phoneNumber: '555-1234', // Duplicate
        status: 'customer',
      },
    });
    console.log('✗ Failed: Should have rejected duplicate phone number');
  } catch (error: any) {
    if (error.message.includes('unique constraint') || error.message.includes('Phone number already exists')) {
      console.log('✓ Success: Duplicate phone number was rejected');
      console.log(`  Error: ${error.message}`);
    } else {
      console.log(`✗ Unexpected error: ${error.message}`);
    }
  }

  // Test 3: Create contact without phone number (should succeed)
  console.log('\n[Test 3] Creating contact without phone number...');
  try {
    const contact3 = await prisma.contact.create({
      data: {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        phoneNumber: null,
        status: 'lead',
      },
    });
    console.log('✓ Success: Created contact without phone number');
    console.log(`  Contact ID: ${contact3.id}`);
  } catch (error: any) {
    console.log(`✗ Failed: ${error.message}`);
  }

  // Test 4: Update contact to unique phone number
  console.log('\n[Test 4] Updating contact to unique phone number...');
  try {
    const updatedContact = await prisma.contact.update({
      where: { email: 'bob.johnson@example.com' },
      data: { phoneNumber: '555-5678' },
    });
    console.log('✓ Success: Updated contact to phone number 555-5678');
    console.log(`  Contact ID: ${updatedContact.id}`);
  } catch (error: any) {
    console.log(`✗ Failed: ${error.message}`);
  }

  // Test 5: Update contact to duplicate phone number (should fail)
  console.log('\n[Test 5] Updating contact to duplicate phone number...');
  try {
    const updatedContact = await prisma.contact.update({
      where: { email: 'bob.johnson@example.com' },
      data: { phoneNumber: '555-1234' }, // Duplicate
    });
    console.log('✗ Failed: Should have rejected duplicate phone number');
  } catch (error: any) {
    if (error.message.includes('unique constraint') || error.message.includes('Phone number already exists')) {
      console.log('✓ Success: Duplicate phone number was rejected');
      console.log(`  Error: ${error.message}`);
    } else {
      console.log(`✗ Unexpected error: ${error.message}`);
    }
  }

  // Test 6: Update contact without changing phone number (should succeed)
  console.log('\n[Test 6] Updating contact without changing phone number...');
  try {
    const updatedContact = await prisma.contact.update({
      where: { email: 'john.doe.test1@example.com' },
      data: { status: 'customer' },
    });
    console.log('✓ Success: Updated contact without changing phone number');
    console.log(`  Contact ID: ${updatedContact.id}`);
  } catch (error: any) {
    console.log(`✗ Failed: ${error.message}`);
  }

  // Test 7: Update contact to remove phone number (should succeed)
  console.log('\n[Test 7] Updating contact to remove phone number...');
  try {
    const updatedContact = await prisma.contact.update({
      where: { email: 'john.doe.test1@example.com' },
      data: { phoneNumber: null },
    });
    console.log('✓ Success: Removed phone number from contact');
    console.log(`  Contact ID: ${updatedContact.id}`);
  } catch (error: any) {
    console.log(`✗ Failed: ${error.message}`);
  }

  // Cleanup: Remove test contacts
  console.log('\n' + '='.repeat(50));
  console.log('\nCleaning up test contacts...');
  try {
    await prisma.contact.deleteMany({
      where: {
        email: {
          in: [
            'john.doe.test1@example.com',
            'jane.smith@example.com',
            'bob.johnson@example.com',
          ],
        },
      },
    });
    console.log('✓ Test contacts removed');
  } catch (error: any) {
    console.log(`✗ Cleanup failed: ${error.message}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n✓ All tests completed!\n');

  await prisma.$disconnect();
}

testPhoneUniqueness()
  .catch((error) => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
