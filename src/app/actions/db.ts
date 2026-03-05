"use server";

import { getAdminDb, admin } from "@/lib/firebase-admin";

// ── Posts ─────────────────────────────────────────────────────────────────────

export async function checkIsPublished(url: string): Promise<boolean> {
    try {
        const db = getAdminDb();
        const snap = await db.collection("posts").where("url", "==", url).limit(1).get();
        return !snap.empty;
    } catch (err: any) {
        console.error("[DB] checkIsPublished error:", err.message);
        throw err; // Throw so we can see the error in caller
    }
}

/**
 * Bulk check publication status for a list of URLs
 */
export async function checkBulkPublished(urls: string[]): Promise<string[]> {
    if (!urls || urls.length === 0) return [];

    try {
        const db = getAdminDb();
        // Firestore 'in' operator supports up to 30 values.
        // If urls > 30, we'd need to chunk it.
        const chunks = [];
        for (let i = 0; i < urls.length; i += 30) {
            chunks.push(urls.slice(i, i + 30));
        }

        const publishedUrls: string[] = [];
        for (const chunk of chunks) {
            const snap = await db.collection("posts").where("url", "in", chunk).get();
            snap.docs.forEach(doc => {
                const data = doc.data();
                if (data.url) publishedUrls.push(data.url);
            });
        }

        return publishedUrls;
    } catch (err: any) {
        console.error("[DB] checkBulkPublished error:", err.message);
        return [];
    }
}

export async function saveToPublished(article: {
    title: string;
    url: string;
    fbPostId: string;
    category?: string;
    enhancedData?: string;
}) {
    console.log("[DB] Attempting to save to 'posts' collection:", article.url);
    try {
        const db = getAdminDb();
        const docRef = await db.collection("posts").add({
            ...article,
            publishedAt: admin.firestore.Timestamp.now(),
        });
        console.log("[DB] Saved successfully with ID:", docRef.id);
        return { success: true };
    } catch (err: any) {
        console.error("[DB] saveToPublished error:", err.message);
        return { success: false, error: err.message };
    }
}

export async function testFirebaseConnection() {
    try {
        const db = getAdminDb();
        const snap = await db.collection("posts").limit(1).get();
        return { success: true, count: snap.size, message: "Connected to Firestore successfully." };
    } catch (err: any) {
        console.error("[DB] testFirebaseConnection error:", err.message);
        return { success: false, error: err.message };
    }
}

export async function getPublishedPosts() {
    try {
        const db = getAdminDb();
        const snap = await db.collection("posts").orderBy("publishedAt", "desc").get();
        return snap.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
            publishedAt: doc.data().publishedAt?.toDate()?.toISOString(),
        }));
    } catch (err: any) {
        console.error("getPublishedPosts error:", err.message);
        return [];
    }
}

// Delete posts older than 30 days to keep the DB clean
export async function cleanupOldPosts(): Promise<{ success: boolean; deleted?: number; error?: string }> {
    try {
        const db = getAdminDb();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cutoff = admin.firestore.Timestamp.fromDate(thirtyDaysAgo);

        const snap = await db.collection("posts")
            .where("publishedAt", "<", cutoff)
            .get();

        const batch = db.batch();
        snap.docs.forEach((doc: any) => batch.delete(doc.ref));
        await batch.commit();

        return { success: true, deleted: snap.size };
    } catch (err: any) {
        console.error("cleanupOldPosts error:", err.message);
        return { success: false, deleted: 0, error: err.message };
    }
}

// ── Automation (Collection: "automation" → Doc: "status") ────────────────────
// Fields: enabled (boolean), updatedAt, lastRunAt, lastRunStatus, lastRunMessage

export async function getAutomationSettings() {
    try {
        const db = getAdminDb();
        const ref = db.collection("automation").doc("status");
        const snap = await ref.get();

        if (!snap.exists) {
            // Auto-create on first load so the collection appears in Firebase immediately
            await ref.set({ enabled: false, updatedAt: admin.firestore.Timestamp.now() });
            return { enabled: false };
        }

        const data = snap.data()!;
        return {
            enabled: data.enabled ?? false,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? null,
            lastRunAt: data.lastRunAt?.toDate?.()?.toISOString?.() ?? null,
            lastRunStatus: data.lastRunStatus ?? null,
            lastRunMessage: data.lastRunMessage ?? null,
        };
    } catch (err: any) {
        console.error("getAutomationSettings error:", err.message);
        return { enabled: false, error: err.message };
    }
}



export async function updateAutomationSettings(
    enabled: boolean,
    lastRun?: { status: string; message?: string }
) {
    try {
        const db = getAdminDb();
        const data: Record<string, any> = {
            enabled,
            updatedAt: admin.firestore.Timestamp.now(),
        };
        if (lastRun) {
            data.lastRunAt = admin.firestore.Timestamp.now();
            data.lastRunStatus = lastRun.status;
            data.lastRunMessage = lastRun.message ?? "";
        }
        await db.collection("automation").doc("status").set(data, { merge: true });
        return { success: true };
    } catch (err: any) {
        console.error("updateAutomationSettings error:", err.message);
        return { success: false, error: err.message };
    }
}

export async function logSyncSession(details: {
    type: "manual" | "auto" | "passive";
    status: string;
    syncedCount: number;
    articles?: string[];
    message?: string;
}) {
    try {
        const db = getAdminDb();
        await db.collection("sync_history").add({
            ...details,
            timestamp: admin.firestore.Timestamp.now(),
        });
        return { success: true };
    } catch (err: any) {
        console.error("[DB] logSyncSession error:", err.message);
        return { success: false, error: err.message };
    }
}


