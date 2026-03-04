"use server";

import { adminDb, admin } from "@/lib/firebase-admin";

export async function checkIsPublished(url: string) {
    try {
        const snapshot = await adminDb.collection("posts")
            .where("url", "==", url)
            .limit(1)
            .get();
        return !snapshot.empty;
    } catch (error: any) {
        console.error("SECURE_DB_CHECK_ERROR:", error.message);
        return false;
    }
}

export async function saveToPublished(article: { title: string, url: string, fbPostId: string }) {
    try {
        await adminDb.collection("posts").add({
            ...article,
            publishedAt: admin.firestore.Timestamp.now(),
        });
        return { success: true };
    } catch (error: any) {
        console.error("SECURE_DB_SAVE_ERROR:", error.message);
        return { success: false, error: error.message };
    }
}

export async function getPublishedPosts() {
    try {
        const snapshot = await adminDb.collection("posts")
            .orderBy("publishedAt", "desc")
            .get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            publishedAt: doc.data().publishedAt?.toDate()?.toISOString()
        }));
    } catch (error: any) {
        console.error("SECURE_DB_FETCH_POSTS_ERROR:", error.message);
        return [];
    }
}

export async function getAutomationSettings() {
    try {
        const settingsRef = adminDb.collection("settings").doc("automation");
        const settingsDoc = await settingsRef.get();

        if (!settingsDoc.exists) {
            console.log("No settings found. Bootstrapping Securely...");
            const initial = { enabled: false, updatedAt: admin.firestore.Timestamp.now() };
            await settingsRef.set(initial);
            return { enabled: false, updatedAt: initial.updatedAt.toDate().toISOString() };
        }

        const data = settingsDoc.data();
        const serialized = { ...data };
        if (data?.updatedAt) serialized.updatedAt = data.updatedAt.toDate().toISOString();
        if (data?.lastRunAt) serialized.lastRunAt = data.lastRunAt.toDate().toISOString();

        return serialized;
    } catch (error: any) {
        console.error("SECURE_DB_SETTINGS_ERROR:", error.message);
        // Fallback for UI
        return { enabled: false, error: error.message };
    }
}

export async function updateAutomationSettings(enabled: boolean, lastRun?: { status: string, timestamp?: any, message?: string }) {
    try {
        const data: any = { enabled, updatedAt: admin.firestore.Timestamp.now() };
        if (lastRun) {
            // If timestamp passed from client, it's already an object, but we prefer server time for logs
            data.lastRunAt = admin.firestore.Timestamp.now();
            data.lastRunStatus = lastRun.status;
            data.lastRunMessage = lastRun.message;
        }

        await adminDb.collection("settings").doc("automation").set(data, { merge: true });
        return { success: true };
    } catch (error: any) {
        console.error("SECURE_DB_UPDATE_ERROR:", error.message);
        return { success: false, error: error.message };
    }
}
