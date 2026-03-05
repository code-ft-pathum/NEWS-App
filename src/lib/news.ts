export interface Article {
    source: {
        id: string | null;
        name: string;
    };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
}

export interface NewsResponse {
    status: string;
    totalResults: number;
    articles: Article[];
    message?: string;
}

const API_KEY_1 = process.env.NEWS_API_KEY_1;
const API_KEY_2 = process.env.NEWS_API_KEY_2;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://newsapi.org/v2";

export async function getNews(category: string = "general"): Promise<Article[]> {
    const keys = [API_KEY_1, API_KEY_2].filter(k => k && k !== 'YOUR_API_KEY_HERE');

    if (keys.length === 0) {
        console.warn("No NewsAPI keys are set. Using placeholder data.");
        return getPlaceholderArticles(category);
    }

    // Try each key until one works
    for (let i = 0; i < keys.length; i++) {
        const currentKey = keys[i];
        console.log(`[News] Attempting fetch with Key ${i + 1}...`);

        try {
            const params = new URLSearchParams({
                category: category,
                language: "en",
                apiKey: currentKey!,
                pageSize: "12",
            });

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(`${API_URL}/top-headlines?${params.toString()}`, {
                cache: 'no-store',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                // If rate limited or other error, log it and try next key if available
                console.warn(`[News] Key ${i + 1} failed: ${response.status}`);
                if (i < keys.length - 1) continue;
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data: NewsResponse = await response.json();

            if (data.status !== 'ok') {
                console.warn(`[News] Key ${i + 1} data error: ${data.message}`);
                if (i < keys.length - 1) continue;
                throw new Error(data.message || "API error occurred");
            }

            console.log(`[News] Successfully fetched with Key ${i + 1}`);
            return data.articles;
        } catch (error: any) {
            console.error(`[News] Error with Key ${i + 1}:`, error.message);
            if (i < keys.length - 1) {
                console.log("[News] Retrying with next available key...");
                continue;
            }
        }
    }

    // If all keys fail
    return getPlaceholderArticles(category);
}

function getPlaceholderArticles(category: string): Article[] {
    // Generate some stunning placeholders if API fails/key is missing
    return Array.from({ length: 6 }).map((_, i) => ({
        source: { id: "placeholder", name: "Alpha News" },
        author: "Tech Oracle",
        title: `Revolutionary ${category.charAt(0).toUpperCase() + category.slice(1)} Update: The Future is Here`,
        description: "A deep dive into the latest developments that are changing the way we think about the world today. This breakthrough is set to redefine the industry standards for years to come.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date().toISOString(),
        content: null
    }));
}
