import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (serviceAccountRaw) {
            const serviceAccount = JSON.parse(serviceAccountRaw);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else {
            console.warn("FIREBASE_SERVICE_ACCOUNT not found. Defaulting to project instance (Vercel/Local Google Cloud).");
            admin.initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
            });
        }
    } catch (error: any) {
        console.error('FIREBASE ADMIN INITIALIZATION ERROR:', error.message);
    }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export { admin };
