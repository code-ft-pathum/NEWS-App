import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://today-news-pathum.vercel.app';
    const categories = [
        'general',
        'business',
        'technology',
        'science',
        'entertainment',
        'health',
        'sports',
    ];

    const now = new Date().toISOString().split('T')[0];

    // Main sitemap entries
    const mainEntries: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: 'hourly',
            priority: 1.0,
        },
    ];

    // Category page entries
    const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
        url: `${baseUrl}/?category=${category}`,
        lastModified: now,
        changeFrequency: 'hourly' as const,
        priority: 0.9,
    }));

    return [...mainEntries, ...categoryEntries];
}
