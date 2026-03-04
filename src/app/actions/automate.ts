"use server";

import { getNews } from "@/lib/news";
import { publishToFacebook } from "./facebook";
import { checkIsPublished, saveToPublished } from "./db";

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

        // Find the first unpublished article
        let targetArticle = null;
        for (const article of articles) {
            const alreadyPublished = await checkIsPublished(article.url);
            if (!alreadyPublished) {
                targetArticle = article;
                break;
            }
        }

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
