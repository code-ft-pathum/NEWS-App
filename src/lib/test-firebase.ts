// This is a test file to verify Firebase initialization
// You can create a route like /api/test-firebase to debug

import { getAdminDb } from '@/lib/firebase-admin';

export async function testFirebaseInit() {
    try {
        console.log('[Test] Testing Firebase initialization...');
        const db = getAdminDb();
        console.log('[Test] ✓ Firebase initialized successfully');
        
        // Try a simple query
        const testDoc = await db.collection('settings').doc('test').get();
        console.log('[Test] ✓ Database accessible');
        
        return { success: true, message: 'Firebase is properly initialized' };
    } catch (error: any) {
        console.error('[Test] ✗ Firebase initialization failed:', error.message);
        return { 
            success: false, 
            error: error.message,
            hint: 'Check that FIREBASE_SERVICE_ACCOUNT is correctly set in .env'
        };
    }
}
