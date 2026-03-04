"use client";

import { Article } from "@/lib/news";

interface NewsCardProps {
    article: Article;
    index: number;
}

export default function NewsCard({ article, index }: NewsCardProps) {
    const publishedDate = new Date(article.publishedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const publishedISO = new Date(article.publishedAt).toISOString();
    const defaultImg = `https://placehold.co/600x400/111/fff?text=${encodeURIComponent(article.source.name || "News")}&font=roboto`;
    const imgUrl = article.urlToImage || defaultImg;

    // Schema.org NewsArticle structured data
    const newsSchema = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": article.title,
        "description": article.description || article.title,
        "image": [imgUrl],
        "datePublished": publishedISO,
        "author": {
            "@type": "Person",
            "name": article.author || article.source.name
        },
        "publisher": {
            "@type": "Organization",
            "name": article.source.name,
            "logo": {
                "@type": "ImageObject",
                "url": "https://today-news-pathum.vercel.app/android-chrome-512x512.png"
            }
        },
        "mainEntity": {
            "@type": "Article",
            "headline": article.title,
            "datePublished": publishedISO
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(newsSchema) }}
                suppressHydrationWarning
            />
            <div
                className="news-card fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                itemScope
                itemType="https://schema.org/NewsArticle"
            >
                <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    itemProp="url"
                    title={`Read: ${article.title}`}
                >
                    <div className="image-container">
                        <img
                            src={imgUrl}
                            alt={article.title}
                            className="card-img"
                            itemProp="image"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = defaultImg;
                            }}
                        />
                    </div>
                    <div className="card-content">
                        <div className="card-source" itemProp="author">{article.author || article.source.name}</div>
                        <h3 className="card-title" itemProp="headline">{article.title}</h3>
                        <p className="card-desc" itemProp="description">{article.description || "N/A"}</p>
                        <div className="card-meta">
                            <span itemProp="datePublished" content={publishedISO}>
                                {publishedDate}
                            </span>
                            <div className="read-more">
                                READ ARTICLE →
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        </>
    );
}
