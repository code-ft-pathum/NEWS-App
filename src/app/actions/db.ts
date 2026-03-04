"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";

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
