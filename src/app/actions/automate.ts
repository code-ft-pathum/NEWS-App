"use server";

import { getNews } from "@/lib/news";
import { publishToFacebook } from "./facebook";
import { checkIsPublished, saveToPublished, getAutomationSettings } from "./db";

export async function triggerAutomation() {
    console.log("Starting automation trigger...");

    // 1. Check if automation is enabled
    const settings = await getAutomationSettings();
    if (!settings?.enabled) {
        console.log("Automation is disabled. Skipping.");
        return { success: false, message: "Automation disabled" };
    }

    try {
        // 2. Fetch fresh news (general category for broad reach)
        const categories = ["general", "technology", "business", "science"];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const articles = await getNews(randomCategory);

        if (!articles || articles.length === 0) {
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
            console.log("All fetched articles already published.");
            return { success: false, message: "No new articles to post" };
        }

        // 4. Publish to Facebook
        console.log(`Publishing automated post: ${targetArticle.title}`);
        const result = await publishToFacebook({
            title: targetArticle.title,
            url: targetArticle.url,
            description: targetArticle.description,
            urlToImage: targetArticle.urlToImage,
        });

        if (result.success) {
            // 5. Save to history
            await saveToPublished({
                title: targetArticle.title,
                url: targetArticle.url,
                fbPostId: result.postId
            });
            return { success: true, postId: result.postId };
        }

        return { success: false, message: "FB Publish failed" };
    } catch (error: any) {
        console.error("Automation error:", error);
        return { success: false, error: error.message };
    }
}
