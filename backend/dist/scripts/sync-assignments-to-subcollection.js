"use strict";
/**
 * Script to sync assignments from top-level to subcollections
 * This ensures both locations are in sync
 */
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = require("../config/firebase");
async function syncToSubcollections() {
    console.log('Syncing assignments to subcollections...\n');
    try {
        // Get all assignments from top-level collection
        const assignmentsSnapshot = await firebase_1.db.collection('assignments').get();
        console.log(`Found ${assignmentsSnapshot.size} assignments in top-level collection\n`);
        let synced = 0;
        let skipped = 0;
        for (const assignmentDoc of assignmentsSnapshot.docs) {
            const assignmentId = assignmentDoc.id;
            const assignmentData = assignmentDoc.data();
            const courseId = assignmentData.course_id;
            console.log(`Processing: ${assignmentId} - "${assignmentData.title}"`);
            console.log(`  Course ID: ${courseId}`);
            if (!courseId) {
                console.log(`  ✗ Skipping - no course_id`);
                skipped++;
                continue;
            }
            // Check if course exists
            const courseDoc = await firebase_1.db.collection('courses').doc(courseId).get();
            if (!courseDoc.exists) {
                console.log(`  ✗ Skipping - course ${courseId} not found`);
                skipped++;
                continue;
            }
            // Write to subcollection
            await firebase_1.db
                .collection('courses')
                .doc(courseId)
                .collection('assignments')
                .doc(assignmentId)
                .set(assignmentData, { merge: true });
            console.log(`  ✓ Synced to courses/${courseId}/assignments/${assignmentId}`);
            synced++;
        }
        console.log('\n' + '='.repeat(50));
        console.log('Sync complete!');
        console.log(`Total synced: ${synced}`);
        console.log(`Total skipped: ${skipped}`);
        console.log('='.repeat(50));
    }
    catch (error) {
        console.error('Sync failed:', error);
        throw error;
    }
}
// Run the sync
syncToSubcollections()
    .then(() => {
    console.log('\nDone!');
    process.exit(0);
})
    .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
//# sourceMappingURL=sync-assignments-to-subcollection.js.map