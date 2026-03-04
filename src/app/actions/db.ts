"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, Timestamp, doc, setDoc, getDoc } from "firebase/firestore";

export async function checkIsPublished(url: string) {
    try {
        const q = query(collection(db, "posts"), where("url", "==", url));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Error checking Firestore:", error);
        return false;
    }
}

export async function saveToPublished(article: { title: string, url: string, fbPostId: string }) {
    try {
        await addDoc(collection(db, "posts"), {
            ...article,
            publishedAt: Timestamp.now(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error saving to Firestore:", error);
        return { success: false, error: "Failed to save post history." };
    }
}

export async function getPublishedPosts() {
    try {
        const querySnapshot = await getDocs(collection(db, "posts"));
        return querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching Firestore collection:", error);
        return [];
    }
}

export async function getAutomationSettings() {
    try {
        const settingsDoc = await getDoc(doc(db, "settings", "automation"));
        return settingsDoc.exists() ? settingsDoc.data() : { enabled: false };
    } catch (error) {
        console.error("Error fetching automation settings:", error);
        return { enabled: false };
    }
}

export async function updateAutomationSettings(enabled: boolean, lastRun?: { status: string, timestamp: Timestamp, message?: string }) {
    try {
        const data: any = { enabled, updatedAt: Timestamp.now() };
        if (lastRun) {
            data.lastRunAt = lastRun.timestamp;
            data.lastRunStatus = lastRun.status;
            data.lastRunMessage = lastRun.message;
        }
        await setDoc(doc(db, "settings", "automation"), data, { merge: true });
        return { success: true };
    } catch (error) {
        console.error("Error updating automation:", error);
        return { success: false };
    }
}
