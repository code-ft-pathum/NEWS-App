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

    const defaultImg = `https://placehold.co/600x400/111/fff?text=${encodeURIComponent(article.source.name || "News")}&font=roboto`;
    const imgUrl = article.urlToImage || defaultImg;

    return (
        <div
            className="news-card fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <a href={article.url} target="_blank" rel="noopener noreferrer">
                <div className="image-container">
                    <img
                        src={imgUrl}
                        alt={article.title}
                        className="card-img"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = defaultImg;
                        }}
                    />
                </div>
                <div className="card-content">
                    <div className="card-source">{article.source.name}</div>
                    <h3 className="card-title">{article.title}</h3>
                    <p className="card-desc">{article.description || "N/A"}</p>
                    <div className="card-meta">
                        <span>{publishedDate}</span>
                        <div className="read-more">
                            READ ARTICLE →
                        </div>
                    </div>
                </div>
            </a>

        </div>
    );
}
