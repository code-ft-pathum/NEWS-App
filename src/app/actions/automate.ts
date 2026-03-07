"use server";

import { getNews, Article } from "@/lib/news";
import { checkBulkPublished, saveToPublished, getAutomationSettings, updateAutomationSettings, logSyncSession, cleanupOldPosts } from "./db";
import { enhanceArticle } from "@/lib/openrouter";
import { publishToFacebook } from "./facebook";

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
            } catch (e) {
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
    } catch (error: any) {
        console.error("[Automation] Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Manually sync unposted articles across all categories.
 * Limits to 15 articles total to prevent rate limits.
 */
export async function syncAllCategories(isPassive: boolean = false) {
    const logPrefix = isPassive ? "[PassiveBulkSync]" : "[ManualSync]";
    console.log(`${logPrefix} Bulk syncing all categories...`);

    // Clean up old published articles (>24h) first
    await cleanupOldPosts();
    const categories = ["general", "technology", "business", "science", "entertainment", "health", "sports"];
    let results = [];
    const settings = await getAutomationSettings();
    let totalSynced = 0;
    const MAX_SYNC = isPassive ? 5 : 15; // Lower cap for background sync to prevent Vercel 504 timeouts

    for (const cat of categories) {
        if (totalSynced >= MAX_SYNC) break; // Safety cap

        const articles = await getNews(cat);
        const urls = articles.map(a => a.url);
        const publishedUrls = await checkBulkPublished(urls);
        const publishedSet = new Set(publishedUrls);

        const unposted = articles.filter(a => !publishedSet.has(a.url));

        for (const article of unposted) {
            if (totalSynced >= MAX_SYNC) break;

            console.log(`${logPrefix} Posting: ${article.title} (${cat})`);
            let enhancedData = undefined;

            if (settings.enhanceEnabled) {
                console.log(`${logPrefix} AI Enhancement for: ${article.title.slice(0, 30)}...`);
                try {
                    enhancedData = await enhanceArticle(article.title, article.description || "");
                } catch (e) {
                    console.warn(`${logPrefix} AI Enhancement failed for: ${article.title.slice(0, 30)}...`);
                }
            }

            const res = await publishToFacebook({
                title: article.title,
                url: article.url,
                description: article.description,
                urlToImage: article.urlToImage,
                enhancedData: enhancedData
            });

            if (res.success) {
                await saveToPublished({
                    title: article.title,
                    url: article.url,
                    fbPostId: res.postId,
                    category: cat,
                    enhancedData: enhancedData ? JSON.stringify(enhancedData) : undefined
                });
                results.push(`✓ ${article.title}`);
                totalSynced++;
                // Wait 1.5 seconds per post to prevent rate limiting but keep execution fast
                await new Promise(r => setTimeout(r, 1500));
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
        type: isPassive ? "passive" : "manual",
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

        // Cooldown: 15 minutes (900,000 ms)
        const cooldown = 15 * 60 * 1000;
        const lastRun = settings.lastRunAt ? new Date(settings.lastRunAt).getTime() : 0;
        const now = Date.now();

        if (now - lastRun < cooldown) {
            return { success: false, message: "Sync on cooldown" };
        }

        console.log("[PassiveSync] Cooldown expired, triggering bulk automation...");

        // Update lastRun immediately to prevent concurrent triggers
        await updateAutomationSettings(settings.enabled || false, settings.enhanceEnabled || false, {
            status: "pending",
            message: "Passive bulk sync started"
        });

        // Run the bulk sync instead of single category sync
        const result = await syncAllCategories(true);

        await updateAutomationSettings(settings.enabled || false, settings.enhanceEnabled || false, {
            status: result.success ? "success" : "failed",
            message: result.message || ""
        });

        // (logSyncSession is already handled internally by syncAllCategories)

        return result;
    } catch (error: any) {
        console.error("[PassiveSync] Error:", error.message);
        return { success: false, error: error.message };
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
    } catch (error: any) {
        console.error("[EnhanceAction] Error:", error.message);
        throw new Error(error.message);
    }
}


