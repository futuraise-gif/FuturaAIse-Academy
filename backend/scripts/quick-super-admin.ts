/**
 * Quick script to create Super Admin
 * Edit the credentials below before running
 */

import * as admin from 'firebase-admin';

// === EDIT THESE CREDENTIALS ===
const SUPER_ADMIN_EMAIL = 'superadmin@futuraai.com';
const SUPER_ADMIN_PASSWORD = 'Admin@123456';
const SUPER_ADMIN_FIRST_NAME = 'Super';
const SUPER_ADMIN_LAST_NAME = 'Admin';
// ===============================

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

async function createSuperAdmin() {
  try {
    console.log('\n=== Creating Super Admin Account ===\n');
    console.log('Email:', SUPER_ADMIN_EMAIL);

    // Check if user already exists
    const existingUserQuery = await db
      .collection('users')
      .where('email', '==', SUPER_ADMIN_EMAIL)
      .get();

    if (!existingUserQuery.empty) {
      console.log('\n⚠️  User already exists. Promoting to Super Admin...\n');

      const userDoc = existingUserQuery.docs[0];
      await userDoc.ref.update({
        role: 'super_admin',
        status: 'active',
        updated_at: new Date().toISOString(),
      });

      console.log('✅ User promoted to Super Admin successfully!\n');
      console.log('User ID:', userDoc.id);
      console.log('Email:', SUPER_ADMIN_EMAIL);
      console.log('Role: SUPER_ADMIN');
      console.log('Status: ACTIVE\n');
    } else {
      console.log('\n🔄 Creating new Super Admin account...\n');

      // Create new Firebase Auth user
      const userRecord = await auth.createUser({
        email: SUPER_ADMIN_EMAIL,
        password: SUPER_ADMIN_PASSWORD,
        displayName: `${SUPER_ADMIN_FIRST_NAME} ${SUPER_ADMIN_LAST_NAME}`,
      });

      console.log('Firebase Auth user created:', userRecord.uid);

      // Create Firestore document
      const now = new Date().toISOString();
      await db
        .collection('users')
        .doc(userRecord.uid)
        .set({
          email: SUPER_ADMIN_EMAIL,
          first_name: SUPER_ADMIN_FIRST_NAME,
          last_name: SUPER_ADMIN_LAST_NAME,
          role: 'super_admin',
          status: 'active',
          created_at: now,
          updated_at: now,
        });

      console.log('✅ Super Admin account created successfully!\n');
      console.log('════════════════════════════════════');
      console.log('User ID:', userRecord.uid);
      console.log('Email:', SUPER_ADMIN_EMAIL);
      console.log('Password:', SUPER_ADMIN_PASSWORD);
      console.log('Role: SUPER_ADMIN');
      console.log('Status: ACTIVE');
      console.log('════════════════════════════════════');
      console.log('\n🔐 Login at: http://localhost:3001/login');
      console.log('   Email:', SUPER_ADMIN_EMAIL);
      console.log('   Password:', SUPER_ADMIN_PASSWORD);
      console.log('\n✨ After login, navigate to Super Admin Dashboard\n');
    }

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createSuperAdmin();
