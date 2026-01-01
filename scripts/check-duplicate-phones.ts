import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicatePhones() {
  console.log('Checking for duplicate phone numbers...\n');

  const contacts = await prisma.contact.findMany({
    where: { phoneNumber: { not: null } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (contacts.length === 0) {
    console.log('✓ No contacts with phone numbers found. Safe to proceed.');
    return;
  }

  const phoneMap = new Map<string, Array<{ id: string; name: string }>>();

  // Group contacts by phone number
  for (const contact of contacts) {
    if (contact.phoneNumber) {
      const existing = phoneMap.get(contact.phoneNumber) || [];
      existing.push({
        id: contact.id,
        name: `${contact.firstName} ${contact.lastName}`,
      });
      phoneMap.set(contact.phoneNumber, existing);
    }
  }

  // Find duplicates
  const duplicates: Array<{ phone: string; contacts: Array<{ id: string; name: string }> }> = [];
  for (const [phone, contactList] of phoneMap.entries()) {
    if (contactList.length > 1) {
      duplicates.push({ phone, contacts: contactList });
    }
  }

  if (duplicates.length === 0) {
    console.log(`✓ Found ${contacts.length} contacts with unique phone numbers. Safe to proceed.`);
  } else {
    console.log(`⚠️  Found ${duplicates.length} duplicate phone number(s):\n`);
    duplicates.forEach(({ phone, contacts }) => {
      console.log(`  Phone: ${phone}`);
      contacts.forEach((c) => {
        console.log(`    - ${c.name} (ID: ${c.id})`);
      });
      console.log('');
    });
    console.log('⚠️  You need to resolve these duplicates before adding the unique constraint.');
  }

  await prisma.$disconnect();
}

checkDuplicatePhones()
  .catch((error) => {
    console.error('Error checking duplicates:', error);
    process.exit(1);
  });
