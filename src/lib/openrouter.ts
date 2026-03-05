export interface EnhancedData {
    description: string;
    hashtags: string[];
    emojis: string;
}

export async function enhanceArticle(title: string, content: string): Promise<EnhancedData> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    // If no API key or default placeholder, return defaults
    if (!apiKey || apiKey === 'YOUR_OPENROUTER_API_KEY_HERE' || apiKey === '') {
        return {
            description: content || title,
            hashtags: ["#news", "#update"],
            emojis: "📰✨"
        };
    }

    try {
        const initialPrompt = `You are a world-class social media strategist for a high-tech news agency.
Task: Rewrite the following news article into a compelling, short social media post.

Source Title: ${title}
Source Summary: ${content || title}

Requirements:
1. Rewrite the description to be punchy, futuristic, and professional (Max 180 characters).
2. Include exactly 3-4 highly relevant emojis.
3. Include exactly 4-5 trending, relevant hashtags.
4. The output must be a single cohesive paragraph containing the description, emojis, and hashtags.
5. Tone: Authoritative, sleek, and engaging.
6. Output ONLY the final text. No preamble.`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

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
                "reasoning": { "enabled": false }
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

        return parseEnhancedText(finalContent);

    } catch (error) {
        console.error("[OpenRouter] Error:", error);
        return {
            description: content || title,
            hashtags: ["#news", "#headline"],
            emojis: "📰"
        };
    }
}

function parseEnhancedText(text: string): EnhancedData {
    // 1. Extract all hashtags
    const hashtags = text.match(/#[a-zA-Z0-9_]+/g) || [];

    // 2. Extract emojis using a more comprehensive regex
    const emojiRegex = /[\u{1F300}-\u{1F99F}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu;
    const emojisMatch = text.match(emojiRegex);
    const emojis = emojisMatch ? emojisMatch.slice(0, 5).join('') : "📰";

    // 3. Clean the description: Remove hashtags and emojis from the text
    let cleanDesc = text
        .replace(/#[a-zA-Z0-9_]+/g, '')
        .replace(emojiRegex, '')
        .replace(/\s+/g, ' ') // Collapse extra spaces
        .trim();

    // Fallback if description becomes empty
    if (!cleanDesc || cleanDesc.length < 5) {
        cleanDesc = text.split('#')[0].trim();
    }

    return {
        description: cleanDesc,
        hashtags: hashtags.map(h => h.trim().toLowerCase()).slice(0, 5),
        emojis: emojis
    };
}
