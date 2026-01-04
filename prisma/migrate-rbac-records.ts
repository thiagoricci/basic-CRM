import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function migrateRecordsToAdmin() {
  console.log('🚀 Starting RBAC data migration...');

  try {
    // Get or create admin user
    let adminUser = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (!adminUser) {
      console.log('⚠️  No admin user found. Creating default admin user...');
      
      // Check if there are any users in the database
      const anyUser = await prisma.user.findFirst();
      
      if (anyUser) {
        // Promote the first user to admin
        adminUser = await prisma.user.update({
          where: { id: anyUser.id },
          data: { role: 'admin' },
        });
        console.log(`✅ Promoted user ${adminUser.email} to admin role`);
      } else {
        // Create a new admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        adminUser = await prisma.user.create({
          data: {
            name: 'Admin',
            email: 'admin@crm.com',
            password: hashedPassword,
            role: 'admin',
            isActive: true,
          },
        });
        console.log(`✅ Created new admin user: ${adminUser.email} (ID: ${adminUser.id})`);
        console.log(`   🔑 Default password: admin123`);
      }
    }

    console.log(`✅ Using admin user: ${adminUser.email} (ID: ${adminUser.id})`);

    // Migrate contacts without userId
    const contactsWithoutUser = await prisma.contact.findMany({
      where: { userId: null },
    });

    console.log(`\n📋 Found ${contactsWithoutUser.length} contacts without userId`);

    if (contactsWithoutUser.length > 0) {
      for (const contact of contactsWithoutUser) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: { userId: adminUser.id },
        });
        console.log(`   ✅ Assigned contact "${contact.firstName} ${contact.lastName}" to admin`);
      }
    }

    // Migrate activities without userId
    const activitiesWithoutUser = await prisma.activity.findMany({
      where: { userId: null },
    });

    console.log(`\n📝 Found ${activitiesWithoutUser.length} activities without userId`);

    if (activitiesWithoutUser.length > 0) {
      for (const activity of activitiesWithoutUser) {
        await prisma.activity.update({
          where: { id: activity.id },
          data: { userId: adminUser.id },
        });
        console.log(`   ✅ Assigned activity "${activity.subject}" to admin`);
      }
    }

    // Migrate tasks without userId
    const tasksWithoutUser = await prisma.task.findMany({
      where: { userId: null },
    });

    console.log(`\n✅ Found ${tasksWithoutUser.length} tasks without userId`);

    if (tasksWithoutUser.length > 0) {
      for (const task of tasksWithoutUser) {
        await prisma.task.update({
          where: { id: task.id },
          data: { userId: adminUser.id },
        });
        console.log(`   ✅ Assigned task "${task.title}" to admin`);
      }
    }

    // Migrate deals without userId
    const dealsWithoutUser = await prisma.deal.findMany({
      where: { userId: null },
    });

    console.log(`\n💰 Found ${dealsWithoutUser.length} deals without userId`);

    if (dealsWithoutUser.length > 0) {
      for (const deal of dealsWithoutUser) {
        await prisma.deal.update({
          where: { id: deal.id },
          data: { userId: adminUser.id },
        });
        console.log(`   ✅ Assigned deal "${deal.name}" to admin`);
      }
    }

    // Summary
    const totalMigrated =
      contactsWithoutUser.length +
      activitiesWithoutUser.length +
      tasksWithoutUser.length +
      dealsWithoutUser.length;

    console.log(`\n✨ Migration complete!`);
    console.log(`   📊 Total records migrated: ${totalMigrated}`);
    console.log(`   📋 Contacts: ${contactsWithoutUser.length}`);
    console.log(`   📝 Activities: ${activitiesWithoutUser.length}`);
    console.log(`   ✅ Tasks: ${tasksWithoutUser.length}`);
    console.log(`   💰 Deals: ${dealsWithoutUser.length}`);
    
    if (totalMigrated === 0) {
      console.log(`\n✅ All records already have userId assigned. No migration needed.`);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateRecordsToAdmin();
