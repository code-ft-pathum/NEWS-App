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

export async function saveToPublished(article: { title: string; url: string; fbPostId: string }) {
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

// ── Automation (simple collection: "automation" → doc "status") ───────────────
// Firestore structure:
//   Collection: automation
//   Document:   status
//   Fields:     enabled (boolean), updatedAt (Timestamp),
//               lastRunAt (Timestamp), lastRunStatus (string), lastRunMessage (string)

export async function getAutomationSettings() {
    try {
        const db = getAdminDb();
        const ref = db.collection("automation").doc("status");
        const snap = await ref.get();

        if (!snap.exists) {
            // Bootstrap with disabled state so the collection is created immediately
            await ref.set({ enabled: false, updatedAt: admin.firestore.Timestamp.now() });
            return { enabled: false };
        }

        const data = snap.data()!;
        // Serialize Timestamps → ISO strings so Next.js can pass them to client components
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
