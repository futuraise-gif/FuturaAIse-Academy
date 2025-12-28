/**
 * Firebase connectivity test utility
 * Call this in the browser console to diagnose Firebase issues
 */

import { auth } from '@/config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export async function testFirebaseConnection() {
  console.log('🔍 Testing Firebase Configuration...\n');

  // Test 1: Check Firebase config
  console.log('1️⃣ Firebase Config:', {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '✗ Missing',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '✗ Missing',
  });

  // Test 2: Check if Firebase Auth is initialized
  console.log('\n2️⃣ Firebase Auth:', auth ? '✓ Initialized' : '✗ Not initialized');

  // Test 3: Check network connectivity to Firebase
  console.log('\n3️⃣ Testing network connectivity to Firebase...');

  try {
    const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + import.meta.env.VITE_FIREBASE_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: 'test' })
    });

    if (response.status === 400) {
      console.log('✓ Can reach Firebase servers (expected 400 for invalid token)');
    } else {
      console.log('Response status:', response.status);
    }
  } catch (error) {
    console.error('✗ Cannot reach Firebase servers:', error);
    console.log('\n🚨 Possible causes:');
    console.log('  - Network connectivity issue');
    console.log('  - Firewall blocking Firebase');
    console.log('  - Browser extension blocking requests');
    console.log('  - Ad blocker interfering');
  }

  // Test 4: Check CORS and fetch to backend
  console.log('\n4️⃣ Testing backend API connectivity...');
  try {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';
    const response = await fetch(backendUrl + '/health', {
      method: 'GET',
    });
    console.log('✓ Backend reachable:', response.status);
  } catch (error) {
    console.error('✗ Backend not reachable:', error);
  }

  console.log('\n✅ Diagnostics complete!');
}

// Make available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testFirebase = testFirebaseConnection;
}
