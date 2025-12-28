const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json';
const serviceAccount = require(path.resolve(serviceAccountPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function checkStudents() {
  try {
    console.log('\n=== Checking all users in database ===\n');

    // Get all users
    const allUsersSnapshot = await db.collection('users').get();
    console.log(`Total users in database: ${allUsersSnapshot.size}\n`);

    // Show all users with their roles
    console.log('All users:');
    allUsersSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ID: ${doc.id}`);
      console.log(`   Name: ${data.first_name} ${data.last_name}`);
      console.log(`   Email: ${data.email}`);
      console.log(`   Role: "${data.role}" (type: ${typeof data.role})`);
      console.log(`   Status: ${data.status}`);
      console.log('');
    });

    // Count by role
    console.log('\n=== Users by role ===');
    const roleCounts = {};
    allUsersSnapshot.docs.forEach(doc => {
      const role = doc.data().role;
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`${role}: ${count}`);
    });

    // Try querying with 'student' role
    console.log('\n=== Querying for role === "student" ===');
    const studentSnapshot = await db.collection('users')
      .where('role', '==', 'student')
      .get();
    console.log(`Found ${studentSnapshot.size} users with role='student'\n`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkStudents();
