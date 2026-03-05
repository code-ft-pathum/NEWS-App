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
        const initialPrompt = `You are a professional social media manager.
Task: Create a premium, futuristic news summary for this article.
Title: ${title}
Original Summary: ${content || title}

Requirements:
1. Include 3-4 professional and relevant emojis.
2. Include 3-5 trending hashtags.
3. Keep the content strictly under 220 characters.
4. Tone: Engaging, sleek, and high-tech.
5. Output ONLY the final enhanced text. No preamble.`;

        // First API call with reasoning
        let response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
            })
        });

        if (!response.ok) {
            const errorTrace = await response.text();
            console.error(`[OpenRouter] Call failed (${response.status}):`, errorTrace);
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        const firstMessage = result.choices[0].message;

        // Second API call - refine and stabilize
        const messages = [
            {
                role: 'user',
                content: initialPrompt,
            },
            {
                role: 'assistant',
                content: firstMessage.content,
                reasoning_details: firstMessage.reasoning_details,
            },
            {
                role: 'user',
                content: "Finalize this. Ensure character count is under 220, exactly 3-4 emojis are present, and 3-5 hashtags are integrated. Return ONLY the final text.",
            },
        ];

        const response2 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "model": "stepfun/step-3.5-flash:free",
                "messages": messages
            })
        });

        if (!response2.ok) {
            return parseEnhancedText(firstMessage.content || content || title);
        }

        const result2 = await response2.json();
        const finalContent = result2.choices[0].message.content.trim();

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
    const hashtags = text.match(/#[a-zA-Z0-9_]+/g) || [];
    const emojisMatch = text.match(/[\u{1F300}-\u{1F99F}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu);
    const emojis = emojisMatch ? emojisMatch.join('') : "";

    // Clean description by removing elements we want to handle separately in the UI
    let cleanDesc = text
        .replace(/#[a-zA-Z0-9_]+/g, '')
        .replace(/[\u{1F300}-\u{1F99F}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .trim();

    if (!cleanDesc || cleanDesc.length < 5) cleanDesc = text;

    return {
        description: cleanDesc,
        hashtags: hashtags.map(h => h.trim()).slice(0, 5),
        emojis: emojis.slice(0, 10)
    };
}
