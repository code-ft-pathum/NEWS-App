"use server";


import { getNews } from "@/lib/news";
import { checkBulkPublished, saveToPublished, getAutomationSettings, updateAutomationSettings, logSyncSession, cleanupOldPosts } from "./db";
import { enhanceArticle } from "@/lib/openrouter";
import { publishToFacebook } from "./facebook";

const MANUAL_SYNC_LIMIT = 15;
const SCHEDULED_SYNC_LIMIT = 2;
const SCHEDULED_SYNC_COOLDOWN_MS = 5 * 60 * 1000;

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Unknown error";
}

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

        // AI Enhancement
        const settings = await getAutomationSettings();
        let enhancedData = undefined;

        if (settings.enhanceEnabled) {
            console.log("[Automation] AI Enhancement is ON. Enhancing...");
            try {
                const enhanced = await enhanceArticle(targetArticle.title, targetArticle.description || "");
                enhancedData = enhanced;
            } catch {
                console.warn("[Automation] AI Enhancement failed, using raw data.");
            }
        }

        // Publish to Facebook
        const result = await publishToFacebook({
            title: targetArticle.title,
            url: targetArticle.url,
            description: targetArticle.description,
            urlToImage: targetArticle.urlToImage,
            enhancedData: enhancedData
        });

        if (result.success) {
            // Save to history
            await saveToPublished({
                title: targetArticle.title,
                url: targetArticle.url,
                fbPostId: result.postId,
                category: category,
                enhancedData: enhancedData ? JSON.stringify(enhancedData) : undefined
            });

            return { success: true, postId: result.postId, message: `Posted: ${targetArticle.title}` };
        }

        return { success: false, message: "Facebook publish failed" };
    } catch (error: unknown) {
        console.error("[Automation] Error:", error);
        return { success: false, error: getErrorMessage(error) };
    }
}

/**
 * Manually sync unposted articles across all categories.
 * Bulk sync always skips AI enhancement so frequent runs stay fast.
 */
export async function syncAllCategories(mode: "manual" | "passive" | "cron" = "manual") {
    const isScheduledMode = mode !== "manual";
    const logPrefix = mode === "cron" ? "[CronSync]" : mode === "passive" ? "[PassiveBulkSync]" : "[ManualSync]";
    console.log(`${logPrefix} Bulk syncing all categories...`);

    const results: string[] = [];
    let totalSynced = 0;

    try {
        // Clean up old published articles (>24h) first
        await cleanupOldPosts();
        const categories = ["general", "technology", "business", "science", "entertainment", "health", "sports"];
        const maxSync = isScheduledMode ? SCHEDULED_SYNC_LIMIT : MANUAL_SYNC_LIMIT;

        for (const cat of categories) {
            if (totalSynced >= maxSync) break;

            const articles = await getNews(cat);
            const urls = articles.map(a => a.url);
            const publishedUrls = await checkBulkPublished(urls);
            const publishedSet = new Set(publishedUrls);

            const unposted = articles.filter(a => !publishedSet.has(a.url));

            for (const article of unposted) {
                if (totalSynced >= maxSync) break;

                console.log(`${logPrefix} Posting: ${article.title} (${cat})`);

                try {
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
                        // Keep a short gap between posts to reduce Facebook rate-limit pressure.
                        await new Promise(r => setTimeout(r, 1500));
                    }
                } catch (postError: unknown) {
                    console.error(`${logPrefix} Failed to publish to FB:`, getErrorMessage(postError));
                    results.push(`❌ Failed: ${article.title.slice(0, 30)}...`);
                    // Specifically intentionally absorbing the error so the loop continues
                    // to the next article without crashing the entire action.
                }
            }
        }

        const summary = {
            success: true,
            message: totalSynced > 0
                ? `Successfully synced ${totalSynced} article${totalSynced === 1 ? "" : "s"}${isScheduledMode ? " in fast mode." : "."}`
                : "No new articles found to sync.",
            details: results
        };

        // Save sync session to Firebase history
        await logSyncSession({
            type: mode === "manual" ? "manual" : "passive",
            status: totalSynced > 0 ? "success" : "no_updates",
            syncedCount: totalSynced,
            articles: results,
            message: summary.message
        });

        return summary;
    } catch (globalError: unknown) {
        const message = getErrorMessage(globalError);
        console.error(`${logPrefix} Critical execution error:`, message);
        return {
            success: false,
            message: `Server Error: ${message}`,
            details: results
        };
    }
}

/**
 * Passive Sync: Triggers automatically when users browse the site.
 * Won't run more than once every 5 minutes.
 */
export async function checkAndPassiveSync() {
    try {
        const settings = await getAutomationSettings();

        // Skip if automation is disabled
        if (!settings.enabled) {
            return { success: false, message: "Automation is disabled" };
        }

        const lastRun = settings.lastRunAt ? new Date(settings.lastRunAt).getTime() : 0;
        const now = Date.now();

        if (now - lastRun < SCHEDULED_SYNC_COOLDOWN_MS) {
            return { success: false, message: "Sync on cooldown" };
        }

        console.log("[PassiveSync] Cooldown expired, triggering bulk automation...");

        // Update lastRun immediately to prevent concurrent triggers
        await updateAutomationSettings(settings.enabled || false, settings.enhanceEnabled || false, {
            status: "pending",
            message: "Scheduled bulk sync started"
        });

        // Run the bulk sync instead of single category sync
        const result = await syncAllCategories("passive");

        await updateAutomationSettings(settings.enabled || false, settings.enhanceEnabled || false, {
            status: result.success ? "success" : "failed",
            message: result.message || ""
        });

        // (logSyncSession is already handled internally by syncAllCategories)

        return result;
    } catch (error: unknown) {
        const message = getErrorMessage(error);
        console.error("[PassiveSync] Error:", message);
        return { success: false, error: message };
    }
}

export async function triggerCronSync() {
    try {
        const settings = await getAutomationSettings();

        if (!settings.enabled) {
            return { success: false, message: "Automation is disabled" };
        }

        const lastRun = settings.lastRunAt ? new Date(settings.lastRunAt).getTime() : 0;
        const now = Date.now();

        if (now - lastRun < SCHEDULED_SYNC_COOLDOWN_MS) {
            return { success: false, message: "Sync on cooldown" };
        }

        console.log("[CronSync] Cooldown expired, triggering bulk automation...");

        await updateAutomationSettings(settings.enabled || false, settings.enhanceEnabled || false, {
            status: "pending",
            message: "cron-job.org sync started"
        });

        const result = await syncAllCategories("cron");

        await updateAutomationSettings(settings.enabled || false, settings.enhanceEnabled || false, {
            status: result.success ? "success" : "failed",
            message: result.message || ""
        });

        return result;
    } catch (error: unknown) {
        const message = getErrorMessage(error);
        console.error("[CronSync] Error:", message);
        return { success: false, error: message };
    }
}

export async function toggleAutomationStatus() {
    const settings = await getAutomationSettings();
    const newStatus = !settings.enabled;
    await updateAutomationSettings(newStatus, settings.enhanceEnabled);
    return newStatus;
}

export async function toggleEnhanceStatus() {
    const settings = await getAutomationSettings();
    const newStatus = !settings.enhanceEnabled;
    await updateAutomationSettings(settings.enabled, newStatus);
    return newStatus;
}

export async function enhanceAction(title: string, description: string) {
    try {
        return await enhanceArticle(title, description);
    } catch (error: unknown) {
        const message = getErrorMessage(error);
        console.error("[EnhanceAction] Error:", message);
        throw new Error(message);
    }
}


