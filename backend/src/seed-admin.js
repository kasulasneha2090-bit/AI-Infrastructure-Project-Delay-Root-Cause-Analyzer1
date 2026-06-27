/**
 * Seed Script: Initial Admin & Allowed Users Setup
 * 
 * Run this ONCE to create:
 * 1. Two entries in the `allowedUsers` Firestore collection
 * 2. The initial admin user account in the `users` collection
 * 
 * Usage: node src/seed-admin.js
 * 
 * IMPORTANT: Change the admin password immediately after first login!
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db } = require('./utils/firebase');

const SEED_DATA = {
  allowedUsers: [
    {
      email: 'admin@crownridge.com',
      name: 'System Administrator',
      role: 'admin',
      status: 'active'
    },
    {
      email: 'manager@crownridge.com',
      name: 'Project Manager',
      role: 'user',
      status: 'active'
    }
  ],
  adminAccount: {
    name: 'System Administrator',
    email: 'admin@crownridge.com',
    password: 'Admin@2026',
    role: 'Administrator'
  }
};

async function seed() {
  console.log('🔧 Crownridge Auth Seed Script');
  console.log('================================\n');

  try {
    // Step 1: Seed allowedUsers collection
    console.log('📋 Step 1: Seeding allowedUsers collection...');
    for (const entry of SEED_DATA.allowedUsers) {
      // Check if already exists
      const existing = await db.collection('allowedUsers')
        .where('email', '==', entry.email)
        .limit(1)
        .get();

      if (!existing.empty) {
        console.log(`   ⏭️  Skipped (already exists): ${entry.email}`);
        continue;
      }

      await db.collection('allowedUsers').add({
        ...entry,
        createdAt: new Date().toISOString()
      });
      console.log(`   ✅ Added: ${entry.email} (role: ${entry.role}, status: ${entry.status})`);
    }

    // Step 2: Create the admin user account
    console.log('\n👤 Step 2: Creating admin user account...');
    const adminEmail = SEED_DATA.adminAccount.email;

    const existingUser = await db.collection('users')
      .where('email', '==', adminEmail)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      console.log(`   ⏭️  Skipped (already exists): ${adminEmail}`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(SEED_DATA.adminAccount.password, salt);

      await db.collection('users').add({
        name: SEED_DATA.adminAccount.name,
        email: SEED_DATA.adminAccount.email,
        password: hashedPassword,
        role: SEED_DATA.adminAccount.role,
        createdAt: new Date().toISOString()
      });
      console.log(`   ✅ Created admin account: ${adminEmail}`);
      console.log(`   🔑 Password: ${SEED_DATA.adminAccount.password}`);
    }

    console.log('\n================================');
    console.log('✅ Seed completed successfully!');
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!');
    console.log('\nYou can now log in with:');
    console.log(`   Email:    ${SEED_DATA.adminAccount.email}`);
    console.log(`   Password: ${SEED_DATA.adminAccount.password}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
