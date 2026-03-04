"use server";

import { getAdminDb, admin } from "@/lib/firebase-admin";

// ── Posts ─────────────────────────────────────────────────────────────────────

export async function checkIsPublished(url: string): Promise<boolean> {
    try {
        const db = getAdminDb();
        const snap = await db.collection("posts").where("url", "==", url).limit(1).get();
        return !snap.empty;
    } catch (err: any) {
        console.error("checkIsPublished error:", err.message);
        return false;
    }
}

export async function saveToPublished(article: {
    title: string;
    url: string;
    fbPostId: string;
    category?: string;
}) {
    try {
        const db = getAdminDb();
        await db.collection("posts").add({
            ...article,
            publishedAt: admin.firestore.Timestamp.now(),
        });
        return { success: true };
    } catch (err: any) {
        console.error("saveToPublished error:", err.message);
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

// Used by cron.ts — returns just the boolean
export async function getCronStatus(): Promise<boolean> {
    try {
        const settings = await getAutomationSettings();
        return settings?.enabled ?? false;
    } catch {
        return false;
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

// Toggle automation on/off — used by CronToggle component
export async function toggleCronStatus(): Promise<boolean> {
    const current = await getAutomationSettings();
    const newEnabled = !current.enabled;
    await updateAutomationSettings(newEnabled);
    return newEnabled;
}
