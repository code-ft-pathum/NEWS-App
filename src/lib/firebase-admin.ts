import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!raw) {
        console.error('[Firebase Admin] FIREBASE_SERVICE_ACCOUNT env var is missing!');
    } else {
        try {
            // 1. Strip surrounding single/double quotes that .env parsers sometimes add
            let cleaned = raw.trim();
            if ((cleaned.startsWith("'") && cleaned.endsWith("'")) ||
                (cleaned.startsWith('"') && cleaned.endsWith('"'))) {
                cleaned = cleaned.slice(1, -1);
            }

            // 2. Parse the JSON
            const serviceAccount = JSON.parse(cleaned);

            // 3. CRITICAL: Replace literal \n sequences with actual newlines in the PEM key.
            //    .env files store \n as a literal backslash+n, but the RSA parser needs real newlines.
            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });

            console.log('[Firebase Admin] ✓ Initialized successfully.');
        } catch (err: any) {
            console.error('[Firebase Admin] INIT ERROR:', err.message);
        }
    }
}

export const getAdminDb = () => {
    if (admin.apps.length === 0) {
        throw new Error('Firebase Admin not initialized. Check FIREBASE_SERVICE_ACCOUNT in your environment variables.');
    }
    return admin.firestore();
};

export const getAdminAuth = () => {
    if (admin.apps.length === 0) {
        throw new Error('Firebase Admin not initialized.');
    }
    return admin.auth();
};

export { admin };
