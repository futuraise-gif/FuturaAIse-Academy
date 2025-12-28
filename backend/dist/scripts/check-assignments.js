"use strict";
/**
 * Script to check where assignments are stored
 */
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = require("../config/firebase");
async function checkAssignments() {
    console.log('Checking assignments...\n');
    try {
        // Check top-level collection
        console.log('=== TOP-LEVEL ASSIGNMENTS COLLECTION ===');
        const topLevelSnapshot = await firebase_1.db.collection('assignments').get();
        console.log(`Found ${topLevelSnapshot.size} assignments in top-level collection\n`);
        topLevelSnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`ID: ${doc.id}`);
            console.log(`  Title: ${data.title}`);
            console.log(`  Course ID: ${data.course_id}`);
            console.log(`  Status: ${data.status}`);
            console.log(`  Created: ${data.created_at}`);
            console.log('');
        });
        // Check subcollections
        console.log('\n=== SUBCOLLECTIONS ===');
        const coursesSnapshot = await firebase_1.db.collection('courses').get();
        for (const courseDoc of coursesSnapshot.docs) {
            const courseId = courseDoc.id;
            const courseData = courseDoc.data();
            const assignmentsSnapshot = await firebase_1.db
                .collection('courses')
                .doc(courseId)
                .collection('assignments')
                .get();
            if (assignmentsSnapshot.size > 0) {
                console.log(`\nCourse: ${courseId} (${courseData.title})`);
                console.log(`  Found ${assignmentsSnapshot.size} assignments in subcollection`);
                assignmentsSnapshot.forEach((doc) => {
                    const data = doc.data();
                    console.log(`  - ${doc.id}: ${data.title} (${data.status})`);
                });
            }
        }
    }
    catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
// Run the check
checkAssignments()
    .then(() => {
    console.log('\nDone!');
    process.exit(0);
})
    .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
//# sourceMappingURL=check-assignments.js.map