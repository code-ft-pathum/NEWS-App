import * as admin from 'firebase-admin';

let initError: string | null = null;

function initAdmin() {
    if (admin.apps.length > 0) return;

    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!raw) {
        initError = "FIREBASE_SERVICE_ACCOUNT environment variable is missing.";
        console.error(`[Firebase Admin] ${initError}`);
        return;
    }

    try {
        // Strip surrounding quotes
        let cleaned = raw.trim();
        if ((cleaned.startsWith("'") && cleaned.endsWith("'")) ||
            (cleaned.startsWith('"') && cleaned.endsWith('"'))) {
            cleaned = cleaned.slice(1, -1);
        }

        const serviceAccount = JSON.parse(cleaned);

        // Fix private key newlines
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        console.log('[Firebase Admin] ✓ Initialized successfully.');
        initError = null;
    } catch (err: any) {
        initError = `Initialization failed: ${err.message}`;
        console.error(`[Firebase Admin] ${initError}`);
    }
}

export const getAdminDb = () => {
    initAdmin();
    if (admin.apps.length === 0) {
        throw new Error(initError || 'Firebase Admin not initialized.');
    }
    return admin.firestore();
};

export const getAdminAuth = () => {
    initAdmin();
    if (admin.apps.length === 0) {
        throw new Error(initError || 'Firebase Admin not initialized.');
    }
    return admin.auth();
};

export { admin };
