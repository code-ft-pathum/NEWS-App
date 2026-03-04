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

            <style dangerouslySetInnerHTML={{
                __html: `
        .news-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: var(--radius);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            cursor: pointer;
            position: relative;
            height: 100%;
        }

        .news-card:hover {
            transform: translateY(-8px) scale(1.02);
            border-color: var(--primary);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .image-container {
            width: 100%;
            height: 220px;
            background: #1a1a1a;
            position: relative;
            overflow: hidden;
        }

        .card-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s ease;
        }

        .news-card:hover .card-img {
            transform: scale(1.1);
        }

        .card-content {
            padding: 1.8rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            flex-grow: 1;
        }

        .card-source {
            font-size: 0.7rem;
            font-weight: 700;
            color: var(--primary);
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .card-title {
            font-size: 1.25rem;
            font-weight: 700;
            line-height: 1.35;
            color: var(--foreground);
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }

        .card-desc {
            font-size: 0.88rem;
            color: var(--muted);
            line-height: 1.6;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
        }

        .card-meta {
            margin-top: auto;
            padding-top: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.7rem;
            color: var(--muted);
            border-top: 1px solid var(--card-border);
        }

        .read-more {
            color: var(--primary);
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
      `}} />
        </div>
    );
}
