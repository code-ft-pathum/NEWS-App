import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
    const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    try {
        if (serviceAccountRaw) {
            const serviceAccount = JSON.parse(serviceAccountRaw);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else {
            console.warn("FIREBASE_SERVICE_ACCOUNT not found. Using projectId for default app.");
            admin.initializeApp({
                projectId: projectId || 'todaynews-bd81f'
            });
        }
    } catch (error: any) {
        console.error('FIREBASE ADMIN INITIALIZATION ERROR:', error.message);
    }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export { admin };
