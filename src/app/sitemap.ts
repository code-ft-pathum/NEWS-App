import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://today-news-pathum.vercel.app',
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 1,
        },
        {
            url: 'https://today-news-pathum.vercel.app/dashboard/login',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ]
}
