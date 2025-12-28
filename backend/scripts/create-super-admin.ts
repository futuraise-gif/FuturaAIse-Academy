/**
 * Script to create or promote a user to Super Admin
 * Usage: npx ts-node scripts/create-super-admin.ts
 */

import * as admin from 'firebase-admin';
import * as readline from 'readline';

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createSuperAdmin() {
  try {
    console.log('\n=== Create Super Admin Account ===\n');

    const email = await question('Enter email: ');
    const password = await question('Enter password (min 6 chars): ');
    const firstName = await question('Enter first name: ');
    const lastName = await question('Enter last name: ');

    if (!email || !password || !firstName || !lastName) {
      console.error('❌ All fields are required!');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters!');
      process.exit(1);
    }

    console.log('\n🔄 Creating Super Admin account...\n');

    // Check if user already exists
    const existingUserQuery = await db.collection('users').where('email', '==', email).get();

    if (!existingUserQuery.empty) {
      console.log('⚠️  User already exists. Promoting to Super Admin...');

      const userDoc = existingUserQuery.docs[0];
      await userDoc.ref.update({
        role: 'super_admin',
        updated_at: new Date().toISOString(),
      });

      console.log('✅ User promoted to Super Admin successfully!\n');
      console.log('User ID:', userDoc.id);
      console.log('Email:', email);
      console.log('Role: SUPER_ADMIN\n');
    } else {
      // Create new Firebase Auth user
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
      });

      // Create Firestore document
      const now = new Date().toISOString();
      await db.collection('users').doc(userRecord.uid).set({
        email,
        first_name: firstName,
        last_name: lastName,
        role: 'super_admin',
        status: 'active',
        created_at: now,
        updated_at: now,
      });

      console.log('✅ Super Admin account created successfully!\n');
      console.log('User ID:', userRecord.uid);
      console.log('Email:', email);
      console.log('Role: SUPER_ADMIN');
      console.log('Status: ACTIVE\n');
      console.log('🔐 You can now login with:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}\n`);
    }

    rl.close();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error creating Super Admin:', error.message);
    rl.close();
    process.exit(1);
  }
}

async function promoteSuperAdmin() {
  try {
    console.log('\n=== Promote Existing User to Super Admin ===\n');

    const email = await question('Enter email of user to promote: ');

    if (!email) {
      console.error('❌ Email is required!');
      process.exit(1);
    }

    console.log('\n🔄 Searching for user...\n');

    const userQuery = await db.collection('users').where('email', '==', email).get();

    if (userQuery.empty) {
      console.error('❌ User not found with that email!');
      process.exit(1);
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    console.log('Found user:');
    console.log('  Name:', `${userData.first_name} ${userData.last_name}`);
    console.log('  Current Role:', userData.role);
    console.log('  Status:', userData.status);

    const confirm = await question('\nPromote this user to Super Admin? (yes/no): ');

    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Cancelled');
      process.exit(0);
    }

    await userDoc.ref.update({
      role: 'super_admin',
      updated_at: new Date().toISOString(),
    });

    console.log('\n✅ User promoted to Super Admin successfully!\n');

    rl.close();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error promoting user:', error.message);
    rl.close();
    process.exit(1);
  }
}

async function main() {
  const mode = await question(
    '\nChoose option:\n1. Create new Super Admin\n2. Promote existing user\n\nEnter 1 or 2: '
  );

  if (mode === '1') {
    await createSuperAdmin();
  } else if (mode === '2') {
    await promoteSuperAdmin();
  } else {
    console.error('❌ Invalid option');
    rl.close();
    process.exit(1);
  }
}

main();
