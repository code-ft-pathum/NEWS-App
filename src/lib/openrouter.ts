export interface EnhancedData {
    description: string;
    hashtags: string[];
    emojis: string;
}

export async function enhanceArticle(title: string, content: string): Promise<EnhancedData> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    // IMPORTANT: Log for debugging without leaking full key
    if (!apiKey || apiKey === 'YOUR_OPENROUTER_API_KEY_HERE' || apiKey === '') {
        console.warn("[OpenRouter] API Key is MISSING or default placeholder. Using default values.");
        return {
            description: content || title,
            hashtags: ["#news", "#update", "#trending"],
            emojis: "📰🚀"
        };
    }

    console.log("[OpenRouter] Enhancing article with AI...");

    try {
        const initialPrompt = `You are a creative social media manager for a futuristic news platform.
Your objective: Enhance the following news article to make it highly engaging and professional for social platforms.

Title: ${title}
Content: ${content || title}

Requirements:
1. Rewrite the description to be punchy, futuristic, and professional (Max 220 characters).
2. Integrate EXACTLY 2-3 relevant emojis NATURALLY into the description text.
3. Don't start the sentence with an emoji.
4. Generate 4-5 highly relevant, trending hashtags specifically related to this news content.
5. Output ONLY the following format:
[Description with integrated emojis]
---
[Space separated hashtags]`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://today-news-pathum.vercel.app/",
                "X-Title": "Today News App"
            },
            body: JSON.stringify({
                "model": "stepfun/step-3.5-flash:free",
                "messages": [
                    {
                        "role": "user",
                        "content": initialPrompt
                    }
                ],
                "reasoning": { "enabled": true }
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorTrace = await response.text();
            console.error(`[OpenRouter] Call failed (${response.status}):`, errorTrace);
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        const finalContent = result.choices[0].message.content.trim();

        console.log("[OpenRouter] AI response received successfully. Content length:", finalContent.length);
        return parseEnhancedText(finalContent);

    } catch (error) {
        console.error("[OpenRouter] Error during enhancement:", error);
        return {
            description: content || title,
            hashtags: ["#news", "#headline", "#latest"],
            emojis: "📰"
        };
    }
}

function parseEnhancedText(text: string): EnhancedData {
    // 1. Separate by the delimiter if present
    let descriptionPart = text;
    let hashtagPart = "";

    if (text.includes("---")) {
        [descriptionPart, hashtagPart] = text.split("---").map(p => p.trim());
    } else {
        // Fallback: search for last hashtags
        const hashtagMatch = text.match(/#[a-zA-Z0-9_\u4e00-\u9fa5].*/gs);
        if (hashtagMatch) {
            hashtagPart = hashtagMatch[0];
            descriptionPart = text.replace(hashtagPart, "").trim();
        }
    }

    // 2. Extract hashtags from hashtag part
    const hashtags = hashtagPart.match(/#[a-zA-Z0-9_\u4e00-\u9fa5]+/g) || [];

    // 3. Extract emojis for leading placement (taking first one found as an 'icon')
    // @ts-ignore: TS complains about 'u' flag on older targets, but Node/Next.js supports it
    const emojiRegex = /[\u{1F300}-\u{1F99F}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu;
    const emojisMatch = descriptionPart.match(emojiRegex);
    const leadingEmoji = emojisMatch ? emojisMatch[0] : "✨";

    // Clean description: Remove hashtags if they leaked into descriptionPart
    let cleanDesc = descriptionPart
        .replace(/#[a-zA-Z0-9_\u4e00-\u9fa5]+/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Ensure we don't exceed 3 emojis if they leaked or were over-generated
    const allEmojis = cleanDesc.match(emojiRegex) || [];
    if (allEmojis.length > 3) {
        // This is tricky to trim without breaking text, but the prompt should handle it.
        // We'll trust the prompt for now.
    }

    // Remove quotes
    cleanDesc = cleanDesc.replace(/^["']|["']$/g, '');

    // Fallback if description becomes empty
    if (!cleanDesc || cleanDesc.length < 5) {
        cleanDesc = text.split('#')[0].trim();
    }

    return {
        description: cleanDesc,
        hashtags: hashtags.map(h => h.trim()).slice(0, 5),
        emojis: leadingEmoji
    };
}
