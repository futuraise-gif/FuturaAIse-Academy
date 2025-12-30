"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = require("../config/firebase");
async function initializeFirestore() {
    try {
        console.log('Initializing Firestore database...');
        // Try to create a test document to initialize Firestore
        const testRef = firebase_1.db.collection('_system').doc('init');
        await testRef.set({
            initialized: true,
            timestamp: new Date().toISOString(),
        });
        console.log('✓ Firestore initialized successfully');
        // Clean up test document
        await testRef.delete();
        console.log('✓ Test document cleaned up');
        process.exit(0);
    }
    catch (error) {
        console.error('✗ Firestore initialization failed:', error.message);
        console.error('\nPlease enable Firestore in Firebase Console:');
        console.error('1. Go to https://console.firebase.google.com/project/futureaise-a45b5/firestore');
        console.error('2. Click "Create database"');
        console.error('3. Select a location closest to you');
        console.error('4. Choose "Start in production mode" (we\'ll add rules later)');
        process.exit(1);
    }
}
initializeFirestore();
//# sourceMappingURL=init-firestore.js.map