import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const sitemapUrl = 'https://today-news-pathum.vercel.app/sitemap.xml';
    
    return {
        rules: [
            {
                userAgent: 'Googlebot',
                allow: ['/', '?category='],
                disallow: ['/dashboard/', '/api/', '/_next/'],
                crawlDelay: 0,
            },
            {
                userAgent: 'Bingbot',
                allow: ['/', '?category='],
                disallow: ['/dashboard/', '/api/', '/_next/'],
                crawlDelay: 1,
            },
            {
                userAgent: '*',
                allow: ['/', '?category='],
                disallow: ['/dashboard/', '/api/', '/_next/'],
                crawlDelay: 5,
            },
        ],
        sitemap: [sitemapUrl, 'https://today-news-pathum.vercel.app/sitemap-xml'],
        host: 'https://today-news-pathum.vercel.app',
    }
}
