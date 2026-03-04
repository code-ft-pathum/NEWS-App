/**
 * SEO Configuration and utilities for News Today
 */

export const siteConfig = {
    name: "News Today",
    description: "A premium, lightning-fast news reader powered by AI.",
    url: "https://today-news-pathum.vercel.app",
    ogImage: "/android-chrome-512x512.png",
    links: {
        facebook: "https://www.facebook.com/NewsTodayPathum",
    },
};

export const categories = [
    "general",
    "business",
    "technology",
    "science",
    "entertainment",
    "health",
    "sports",
];

export function getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
        general: "Latest general news from around the world with AI-powered insights.",
        business: "Breaking business news, market updates, and economic analysis.",
        technology: "Tech news covering software, hardware, AI, and digital innovation.",
        science: "Latest scientific discoveries, research, and breakthroughs.",
        entertainment: "Entertainment news, celebrity updates, and media coverage.",
        health: "Health news, medical breakthroughs, and wellness updates.",
        sports: "Sports news, game highlights, and athletic achievements.",
    };
    return descriptions[category] || "Latest news from across the globe.";
}

export const structuredData = {
    organization: {
        "@context": "https://schema.org",
        "@type": "NewsMediaOrganization",
        "name": "News Today",
        "alternateName": "News Today - The Future of News",
        "url": siteConfig.url,
        "logo": `${siteConfig.url}${siteConfig.ogImage}`,
        "description": siteConfig.description,
        "sameAs": [siteConfig.links.facebook],
        "foundingDate": "2024",
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "availableLanguage": ["en"]
        },
    },

    website: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "News Today",
        "url": siteConfig.url,
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${siteConfig.url}/?category={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    },

    breadcrumb: {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": siteConfig.url
            }
        ]
    }
};

export const openGraphDefaults = {
    type: "website" as const,
    locale: "en_US" as const,
    siteName: "News Today",
};

export const twitterDefaults = {
    card: "summary_large_image" as const,
};

/**
 * Generate meta tags for a given page
 */
export function generatePageMeta(
    title: string,
    description: string,
    path: string = "/",
    image?: string
) {
    const fullUrl = `${siteConfig.url}${path}`;
    const ogImage = image || siteConfig.ogImage;

    return {
        title,
        description,
        openGraph: {
            url: fullUrl,
            title,
            description,
            images: [
                {
                    url: `${siteConfig.url}${ogImage}`,
                    width: 512,
                    height: 512,
                    alt: title,
                },
            ],
            ...openGraphDefaults,
        },
        twitter: {
            title,
            description,
            images: [`${siteConfig.url}${ogImage}`],
            ...twitterDefaults,
        },
        alternates: {
            canonical: fullUrl,
        },
    };
}
