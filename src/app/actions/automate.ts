"use server";

import { getNews, Article } from "@/lib/news";
import { publishToFacebook } from "./facebook";
import { checkBulkPublished, saveToPublished, getAutomationSettings, updateAutomationSettings, logSyncSession } from "./db";

export async function triggerAutomation(categoryOverride?: string) {
    console.log("[Automation] Triggering news publication...");

    try {
        const categories = ["general", "technology", "business", "science", "entertainment", "health", "sports"];
        const category = categoryOverride || categories[Math.floor(Math.random() * categories.length)];

        console.log(`[Automation] Fetching from category: ${category}`);
        const articles = await getNews(category);

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
        console.error("[Automation] Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Manually sync unposted articles across all categories.
 * Limit to 10 articles total to prevent rate limits.
 */
export async function syncAllCategories() {
    console.log("[ManualSync] Bulk syncing all categories...");
    const categories = ["general", "technology", "business", "science", "entertainment", "health", "sports"];
    let results = [];
    let totalSynced = 0;

    for (const cat of categories) {
        if (totalSynced >= 10) break; // Safety cap

        const articles = await getNews(cat);
        const urls = articles.map(a => a.url);
        const publishedUrls = await checkBulkPublished(urls);
        const publishedSet = new Set(publishedUrls);

        const unposted = articles.filter(a => !publishedSet.has(a.url));

        for (const article of unposted) {
            if (totalSynced >= 10) break;

            console.log(`[ManualSync] Posting: ${article.title} (${cat})`);
            const res = await publishToFacebook({
                title: article.title,
                url: article.url,
                description: article.description,
                urlToImage: article.urlToImage
            });

            if (res.success) {
                await saveToPublished({
                    title: article.title,
                    url: article.url,
                    fbPostId: res.postId,
                    category: cat
                });
                results.push(`✓ ${article.title}`);
                totalSynced++;
                // Wait 3 seconds per post to be safe
                await new Promise(r => setTimeout(r, 3000));
            }
        }
    }

    const summary = {
        success: true,
        message: totalSynced > 0 ? `Successfully synced ${totalSynced} articles.` : "No new articles found to sync.",
        details: results
    };

    // Save sync session to Firebase history
    await logSyncSession({
        type: "manual",
        status: totalSynced > 0 ? "success" : "no_updates",
        syncedCount: totalSynced,
        articles: results,
        message: summary.message
    });

    return summary;
}

/**
 * Passive Sync: Triggers automatically when users browse the site.
 * Won't run more than once every 4 hours.
 */
export async function checkAndPassiveSync() {
    try {
        const settings = await getAutomationSettings();

        // Skip if automation is disabled
        if (!settings.enabled) {
            return { success: false, message: "Automation is disabled" };
        }

        // Cooldown: 30 minutes (1800000 ms)
        const cooldown = 30 * 60 * 1000;
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

        // Save session to history
        await logSyncSession({
            type: "passive",
            status: result.success ? "success" : "failed",
            syncedCount: result.success ? 1 : 0,
            articles: result.success && result.message ? [result.message] : [],
        });

        return result;
    } catch (error: any) {
        console.error("[PassiveSync] Error:", error.message);
        return { success: false, error: error.message };
    }
}

export async function toggleAutomationStatus() {
    const settings = await getAutomationSettings();
    const newStatus = !settings.enabled;
    await updateAutomationSettings(newStatus);
    return newStatus;
}
