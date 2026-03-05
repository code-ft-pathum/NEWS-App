"use server";

import { getNews } from "@/lib/news";
import { publishToFacebook } from "./facebook";
import { checkBulkPublished, saveToPublished, getAutomationSettings, updateAutomationSettings } from "./db";

export async function triggerAutomation() {
    console.log("[Manual] Triggering news publication...");

    try {
        // Fetch fresh news
        const categories = ["general", "technology", "business", "science"];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const articles = await getNews(randomCategory);

        if (!articles || articles.length === 0) {
            return { success: false, message: "No news found from API" };
        }

        // Find the first unpublished article using bulk check
        const urls = articles.map(a => a.url);
        const publishedUrls = await checkBulkPublished(urls);
        const publishedSet = new Set(publishedUrls);

        const targetArticle = articles.find(article => !publishedSet.has(article.url));

        if (!targetArticle) {
            return { success: false, message: "All fetched articles already published" };
        }

        // Publish to Facebook
        const result = await publishToFacebook({
            title: targetArticle.title,
            url: targetArticle.url,
            description: targetArticle.description,
            urlToImage: targetArticle.urlToImage,
        });

        if (result.success) {
            // Save to history
            await saveToPublished({
                title: targetArticle.title,
                url: targetArticle.url,
                fbPostId: result.postId
            });

            return { success: true, postId: result.postId, message: `Posted: ${targetArticle.title}` };
        }

        return { success: false, message: "Facebook publish failed" };
    } catch (error: any) {
        console.error("[Manual] Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Passive Sync: Triggers automatically when users browse the site.
 * Won't run more than once every 4 hours.
 */
export async function checkAndPassiveSync() {
    try {
        const settings = await getAutomationSettings();

        // Cooldown: 4 hours (14400000 ms)
        const cooldown = 4 * 60 * 60 * 1000;
        const lastRun = settings.lastRunAt ? new Date(settings.lastRunAt).getTime() : 0;
        const now = Date.now();

        if (now - lastRun < cooldown) {
            return { success: false, message: "Sync on cooldown" };
        }

        console.log("[PassiveSync] Cooldown expired, triggering automation...");

        // Update lastRun immediately to prevent concurrent triggers
        await updateAutomationSettings(settings.enabled || false, {
            status: "pending",
            message: "Passive sync started"
        });

        const result = await triggerAutomation();

        await updateAutomationSettings(settings.enabled || false, {
            status: result.success ? "success" : "failed",
            message: result.message || result.error || ""
        });

        return result;
    } catch (error: any) {
        console.error("[PassiveSync] Error:", error.message);
        return { success: false, error: error.message };
    }
}
