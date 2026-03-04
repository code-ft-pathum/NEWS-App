"use server";

import { getNews } from "@/lib/news";
import { publishToFacebook } from "./facebook";
import { checkIsPublished, saveToPublished, getAutomationSettings, updateAutomationSettings } from "./db";

export async function triggerAutomation() {
    console.log("Starting automation trigger...");

    // 1. Check if automation is enabled
    const settings = await getAutomationSettings();
    if (!settings?.enabled) {
        console.log("Automation is disabled. Skipping.");
        return { success: false, message: "Automation disabled" };
    }

    try {
        // 2. Fetch fresh news
        const categories = ["general", "technology", "business", "science"];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const articles = await getNews(randomCategory);

        if (!articles || articles.length === 0) {
            await updateAutomationSettings(true, {
                status: "error",
                message: "No news found from API"
            });
            return { success: false, message: "No news found" };
        }

        // 3. Find the first unpublished article
        let targetArticle = null;
        for (const article of articles) {
            const alreadyPublished = await checkIsPublished(article.url);
            if (!alreadyPublished) {
                targetArticle = article;
                break;
            }
        }

        if (!targetArticle) {
            await updateAutomationSettings(true, {
                status: "idle",
                message: "All fetched articles already published"
            });
            return { success: false, message: "No new articles to post" };
        }

        // 4. Publish to Facebook
        const result = await publishToFacebook({
            title: targetArticle.title,
            url: targetArticle.url,
            description: targetArticle.description,
            urlToImage: targetArticle.urlToImage,
        });

        if (result.success) {
            // 5. Save to history and update automation status
            await saveToPublished({
                title: targetArticle.title,
                url: targetArticle.url,
                fbPostId: result.postId
            });

            await updateAutomationSettings(true, {
                status: "success",
                message: `Posted: ${targetArticle.title}`
            });

            return { success: true, postId: result.postId };
        }

        await updateAutomationSettings(true, {
            status: "error",
            message: "FB API returned failure"
        });
        return { success: false, message: "FB Publish failed" };
    } catch (error: any) {
        console.error("Automation error:", error);
        await updateAutomationSettings(true, {
            status: "error",
            message: error.message
        });
        return { success: false, error: error.message };
    }
}
