"use strict";
/**
 * Migration script to copy assignments from subcollections to top-level collection
 * This ensures all assignments are visible to students
 */
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = require("../config/firebase");
async function migrateAssignments() {
    console.log('Starting assignment migration...');
    try {
        // Get all courses
        const coursesSnapshot = await firebase_1.db.collection('courses').get();
        console.log(`Found ${coursesSnapshot.size} courses`);
        let totalMigrated = 0;
        let totalSkipped = 0;
        for (const courseDoc of coursesSnapshot.docs) {
            const courseId = courseDoc.id;
            console.log(`\nProcessing course: ${courseId}`);
            // Get all assignments in this course's subcollection
            const assignmentsSnapshot = await firebase_1.db
                .collection('courses')
                .doc(courseId)
                .collection('assignments')
                .get();
            console.log(`  Found ${assignmentsSnapshot.size} assignments`);
            for (const assignmentDoc of assignmentsSnapshot.docs) {
                const assignmentId = assignmentDoc.id;
                const assignmentData = assignmentDoc.data();
                // Check if it already exists in top-level collection
                const topLevelDoc = await firebase_1.db.collection('assignments').doc(assignmentId).get();
                if (topLevelDoc.exists) {
                    console.log(`  ✓ Assignment ${assignmentId} already exists in top-level collection`);
                    totalSkipped++;
                }
                else {
                    // Copy to top-level collection
                    await firebase_1.db.collection('assignments').doc(assignmentId).set(assignmentData);
                    console.log(`  ✓ Migrated assignment ${assignmentId} (${assignmentData.title})`);
                    totalMigrated++;
                }
            }
        }
        console.log('\n' + '='.repeat(50));
        console.log('Migration complete!');
        console.log(`Total migrated: ${totalMigrated}`);
        console.log(`Total skipped (already existed): ${totalSkipped}`);
        console.log('='.repeat(50));
    }
    catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
}
// Run the migration
migrateAssignments()
    .then(() => {
    console.log('Done!');
    process.exit(0);
})
    .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
//# sourceMappingURL=migrate-assignments.js.map