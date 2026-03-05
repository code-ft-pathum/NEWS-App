"use server";

const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

/**
 * Automatically fetch the Page Access Token using the User Token provided.
 * This is necessary because the feed endpoint requires a Page-specific token.
 */
async function getPageAccessToken(userToken: string, pageId: string) {
    try {
        const response = await fetch(`https://graph.facebook.com/v21.0/${pageId}?fields=access_token&access_token=${userToken}`, {
            next: { revalidate: 3600 } // Cache for 1 hour to avoid excessive calls
        });
        const data = await response.json();

        if (data.access_token) {
            return data.access_token;
        }

        // Fallback: Check /me/accounts if direct field access fails
        const accountsResponse = await fetch(`https://graph.facebook.com/v21.0/me/accounts?access_token=${userToken}`);
        const accountsData = await accountsResponse.json();

        if (accountsData.data && Array.isArray(accountsData.data)) {
            const page = accountsData.data.find((p: any) => p.id === pageId);
            if (page && page.access_token) {
                return page.access_token;
            }
        }

        return null;
    } catch (error) {
        console.error("Critical error fetching Page Access Token:", error);
        return null;
    }
}

import { EnhancedData } from "@/lib/openrouter";

export async function publishToFacebook(article: {
    title: string,
    url: string,
    description: string | null,
    urlToImage: string | null,
    enhancedData?: EnhancedData
}) {
    if (!FB_PAGE_ID || !FB_ACCESS_TOKEN || FB_ACCESS_TOKEN === 'PASTE_YOUR_PAGE_ACCESS_TOKEN_HERE') {
        throw new Error("Missing Facebook Page ID or Access Token. Access Denied.");
    }

    const backlink = "https://today-news-pathum.vercel.app/";

    // Construct premium message using AI enhancement if available
    let message = "";
    if (article.enhancedData) {
        const { description, emojis, hashtags } = article.enhancedData;
        message = `${emojis} ${article.title}\n\n${description}\n\n${hashtags.join(' ')}\n\nRead more at: ${article.url}\n\nShared via ${backlink}`;
    } else {
        message = `${article.title}\n\n${article.description || ""}\n\nRead more at: ${article.url}\n\nShared via ${backlink}`;
    }

    try {
        // Exchange User Token for Page Token if we have a User Token
        const pageToken = await getPageAccessToken(FB_ACCESS_TOKEN, FB_PAGE_ID);
        const tokenToUse = pageToken || FB_ACCESS_TOKEN;

        let endpoint = `https://graph.facebook.com/v21.0/${FB_PAGE_ID}/feed`;
        let body: any = {
            message: message,
            access_token: tokenToUse,
        };

        // If there's an image, use the /photos endpoint for better visibility
        if (article.urlToImage) {
            endpoint = `https://graph.facebook.com/v21.0/${FB_PAGE_ID}/photos`;
            body = {
                url: article.urlToImage,
                caption: message,
                access_token: tokenToUse,
            };
        } else {
            body.link = article.url;
        }

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("FB API Error:", data);
            throw new Error(data.error?.message || "Failed to post to Facebook.");
        }

        return { success: true, postId: data.id || data.post_id };
    } catch (error: any) {
        console.error("Facebook Posting Error:", error);
        throw new Error(error.message);
    }
}
