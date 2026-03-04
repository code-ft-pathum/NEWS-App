"use client";

import { Article } from "@/lib/news";
import { publishToFacebook } from "@/app/actions/facebook";
import { useState } from "react";

interface DashboardGridProps {
    articles: Article[];
}

export default function DashboardGrid({ articles: initialArticles }: DashboardGridProps) {
    const [articles, setArticles] = useState(initialArticles);
    const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleFacebookPublish = async (article: Article) => {
        const id = article.url;
        setLoadingIds(prev => ({ ...prev, [id]: true }));
        setErrorMsg("");
        setSuccessMsg("");

        try {
            const result = await publishToFacebook({
                title: article.title,
                url: article.url,
                description: article.description,
                urlToImage: article.urlToImage,
            });

            if (result.success) {
                setSuccessMsg(`Successfully published to Facebook! Post ID: ${result.postId}`);
            }
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setLoadingIds(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleHideArticle = (url: string) => {
        setArticles(articles.filter(a => a.url !== url));
    };

    return (
        <div className="dashboard-content">
            {successMsg && <p className="fb-success fade-in">{successMsg}</p>}
            {errorMsg && <p className="fb-error fade-in">{errorMsg}</p>}

            <div className="news-management-grid">
                {articles.map((article, index) => (
                    <div key={index} className="management-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="card-info">
                            <div className="source-tag">{article.source.name}</div>
                            <h3 className="card-title">{article.title}</h3>
                            <p className="published-at">{new Date(article.publishedAt).toLocaleString()}</p>
                        </div>

                        <div className="management-controls">
                            <button
                                className={`publish-btn ${loadingIds[article.url] ? 'loading' : ''}`}
                                onClick={() => handleFacebookPublish(article)}
                                disabled={loadingIds[article.url]}
                            >
                                {loadingIds[article.url] ? (
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                ) : (
                                    <><i className="fa-brands fa-facebook"></i> PUBLISH TO FACEBOOK</>
                                )}
                            </button>
                            <button
                                className="hide-btn"
                                onClick={() => handleHideArticle(article.url)}
                            >
                                <i className="fa-solid fa-eye-slash"></i> HIDE FROM LIST
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .dashboard-content {
            margin-top: 2rem;
        }

        .fb-success {
            padding: 1.5rem;
            background: rgba(46, 213, 115, 0.1);
            border: 1px solid rgba(46, 213, 115, 0.3);
            border-radius: 8px;
            color: #2ed573;
            margin-bottom: 2rem;
            font-weight: 700;
            text-align: center;
        }

        .fb-error {
            padding: 1.5rem;
            background: rgba(255, 71, 87, 0.1);
            border: 1px solid rgba(255, 71, 87, 0.3);
            border-radius: 8px;
            color: #ff4757;
            margin-bottom: 2rem;
            font-weight: 700;
            text-align: center;
        }

        .news-management-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }

        .management-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            padding: 2rem;
            border-radius: var(--radius);
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
        }

        .management-card:hover {
            border-color: var(--primary);
            background: var(--glass-hover);
        }

        .card-info {
            flex: 1;
            padding-right: 2rem;
        }

        .source-tag {
            font-size: 0.65rem;
            font-weight: 800;
            color: var(--primary);
            letter-spacing: 2px;
            margin-bottom: 0.5rem;
        }

        .card-title {
            font-size: 1.15rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: var(--foreground);
        }

        .published-at {
            color: var(--muted);
            font-size: 0.75rem;
        }

        .management-controls {
            display: flex;
            gap: 1rem;
        }

        .publish-btn, .hide-btn {
            padding: 0.8rem 1.4rem;
            border-radius: 8px;
            font-size: 0.7rem;
            font-weight: 800;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            border: none;
        }

        .publish-btn {
            background: #1877f2;
            color: white;
        }

        .publish-btn:hover:not(:disabled) {
            background: #166fe5;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(24, 119, 242, 0.4);
        }

        .publish-btn.loading {
            opacity: 0.8;
            cursor: wait;
        }

        .hide-btn {
            background: var(--glass);
            border: 1px solid var(--card-border);
            color: var(--muted);
        }

        .hide-btn:hover {
            color: var(--foreground);
            background: var(--glass-hover);
            border-color: rgba(255,255,255,0.2);
        }

        @media (max-width: 900px) {
            .management-card {
                flex-direction: column;
                align-items: flex-start;
                gap: 1.5rem;
            }
            .card-info { padding-right: 0; }
            .management-controls { width: 100%; }
            .publish-btn, .hide-btn { flex: 1; justify-content: center; }
        }
      `}} />
        </div>
    );
}
