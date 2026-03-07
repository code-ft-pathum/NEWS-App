const fs = require('fs');
require('dotenv').config({ path: '.env' });

async function test() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const body = JSON.stringify({
        "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
        "messages": [
            {
                "role": "user",
                "content": "Rewrite this description to be short and punchy. Include exactly 2 emojis and 3 hashtags.\nTitle: SpaceX launches new rocket\nDescription: SpaceX has successfully launched its new heavy lift rocket today."
            }
        ]
    });

    const start = Date.now();
    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body
        });
        const text = await res.text();
        console.log(`Time: ${Date.now() - start}ms`, res.status, text);
    } catch (e) {
        console.error(e);
    }
}
test();
