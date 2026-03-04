"use client";

import { Article } from "@/lib/news";
import { publishToFacebook } from "@/app/actions/facebook";
import { checkIsPublished, saveToPublished } from "@/app/actions/db";
import { useState, useEffect } from "react";

interface DashboardGridProps {
    articles: Article[];
}

export default function DashboardGrid({ articles: initialArticles }: DashboardGridProps) {
    const [articles, setArticles] = useState<Article[]>(initialArticles);
    const [publishedUrls, setPublishedUrls] = useState<Set<string>>(new Set());
    const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [editingArticle, setEditingArticle] = useState<string | null>(null);

    // Track local edits
    const [editData, setEditData] = useState<Record<string, { title: string, description: string }>>({});

    useEffect(() => {
        const fetchStatus = async () => {
            const urls = articles.map(a => a.url);
            const statusMap: string[] = [];
            for (const url of urls) {
                const isPub = await checkIsPublished(url);
                if (isPub) statusMap.push(url);
            }
            setPublishedUrls(new Set(statusMap));
        };
        fetchStatus();
    }, [articles]);

    const handleFacebookPublish = async (article: Article) => {
        const id = article.url;

        // Prevent duplicate publishing
        if (publishedUrls.has(id)) {
            setErrorMsg("This article is already published to Facebook.");
            return;
        }

        setLoadingIds(prev => ({ ...prev, [id]: true }));
        setErrorMsg("");
        setSuccessMsg("");

        const finalTitle = editData[id]?.title || article.title;
        const finalDesc = editData[id]?.description || article.description;

        try {
            const result = await publishToFacebook({
                title: finalTitle,
                url: article.url,
                description: finalDesc,
                urlToImage: article.urlToImage,
            });

            if (result.success) {
                // Save to Firestore
                await saveToPublished({
                    title: finalTitle,
                    url: article.url,
                    fbPostId: result.postId
                });

                setPublishedUrls(prev => new Set([...prev, id]));
                setSuccessMsg(`Successfully published! Post ID: ${result.postId}`);
                setEditingArticle(null);
            }
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setLoadingIds(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleEditChange = (url: string, field: 'title' | 'description', value: string) => {
        setEditData(prev => ({
            ...prev,
            [url]: {
                ...(prev[url] || {
                    title: articles.find(a => a.url === url)?.title || "",
                    description: articles.find(a => a.url === url)?.description || ""
                }),
                [field]: value
            }
        }));
    };

    const handleHideArticle = (url: string) => {
        setArticles(articles.filter(a => a.url !== url));
    };

    return (
        <div className="dashboard-content">
            {successMsg && <p className="fb-success fade-in">{successMsg}</p>}
            {errorMsg && <p className="fb-error fade-in">{errorMsg}</p>}

            <div className="news-management-grid">
                {articles.map((article, index) => {
                    const isPublished = publishedUrls.has(article.url);
                    const isEditing = editingArticle === article.url;
                    const currentTitle = editData[article.url]?.title ?? article.title;
                    const currentDesc = editData[article.url]?.description ?? article.description;

                    return (
                        <div key={index} className={`management-card fade-in ${isPublished ? 'published' : ''}`} style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="card-main-content">
                                <div className="card-image-wrapper">
                                    {article.urlToImage ? (
                                        <img src={article.urlToImage} alt={article.title} className="card-thumbnail" />
                                    ) : (
                                        <div className="no-image-placeholder">NO IMAGE</div>
                                    )}
                                    {isPublished && <div className="published-badge">PUBLISHED</div>}
                                </div>

                                <div className="card-info">
                                    <div className="source-tag">{article.source.name}</div>

                                    {isEditing ? (
                                        <div className="edit-fields fade-in">
                                            <input
                                                type="text"
                                                value={currentTitle}
                                                onChange={(e) => handleEditChange(article.url, 'title', e.target.value)}
                                                className="edit-input title-input"
                                            />
                                            <textarea
                                                value={currentDesc}
                                                onChange={(e) => handleEditChange(article.url, 'description', e.target.value)}
                                                className="edit-input desc-input"
                                                rows={3}
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="card-title">{currentTitle}</h3>
                                            <p className="card-desc-preview">{currentDesc}</p>
                                        </>
                                    )}

                                    <p className="published-at">{new Date(article.publishedAt).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="management-controls">
                                {!isPublished && (
                                    <>
                                        <button
                                            className="edit-toggle-btn"
                                            onClick={() => setEditingArticle(isEditing ? null : article.url)}
                                        >
                                            {isEditing ? "CANCEL EDIT" : "EDIT CONTENT"}
                                        </button>
                                        <button
                                            className={`publish-btn ${loadingIds[article.url] ? 'loading' : ''}`}
                                            onClick={() => handleFacebookPublish(article)}
                                            disabled={loadingIds[article.url]}
                                        >
                                            {loadingIds[article.url] ? (
                                                <i className="fa-solid fa-spinner fa-spin"></i>
                                            ) : (
                                                <><i className="fa-brands fa-facebook"></i> PUBLISH</>
                                            )}
                                        </button>
                                    </>
                                )}
                                <button
                                    className="hide-btn"
                                    onClick={() => handleHideArticle(article.url)}
                                >
                                    <i className="fa-solid fa-eye-slash"></i> HIDE
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .dashboard-content { margin-top: 2rem; }

        .fb-success {
            padding: 1.5rem; background: rgba(46, 213, 115, 0.1);
            border: 1px solid rgba(46, 213, 115, 0.3); border-radius: 8px;
            color: #2ed573; margin-bottom: 2rem; font-weight: 700; text-align: center;
        }

        .fb-error {
            padding: 1.5rem; background: rgba(255, 71, 87, 0.1);
            border: 1px solid rgba(255, 71, 87, 0.3); border-radius: 8px;
            color: #ff4757; margin-bottom: 2rem; font-weight: 700; text-align: center;
        }

        .news-management-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }

        .management-card {
            background: var(--card-bg); border: 1px solid var(--card-border);
            padding: 1.5rem; border-radius: var(--radius);
            display: flex; flex-direction: column; gap: 1.5rem; transition: all 0.3s ease;
        }

        .management-card.published { border-color: rgba(46, 213, 115, 0.3); opacity: 0.8; }

        .card-main-content { display: flex; gap: 1.5rem; }

        .card-image-wrapper { 
            position: relative; width: 180px; height: 120px; flex-shrink: 0; 
            border-radius: 8px; overflow: hidden; background: #1a1a1a;
        }

        .card-thumbnail { width: 100%; height: 100%; object-fit: cover; }

        .no-image-placeholder { 
            width: 100%; height: 100%; display: flex; align-items: center; 
            justify-content: center; font-size: 0.6rem; color: var(--muted); font-weight: 800;
        }

        .published-badge {
            position: absolute; top: 8px; left: 8px; background: #2ed573;
            color: black; font-size: 0.55rem; font-weight: 900; padding: 2px 6px;
            border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }

        .card-info { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }

        .source-tag { font-size: 0.6rem; font-weight: 800; color: var(--primary); letter-spacing: 2px; }

        .card-title { font-size: 1.1rem; font-weight: 700; color: var(--foreground); }

        .card-desc-preview { font-size: 0.85rem; color: var(--muted); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        .edit-fields { display: flex; flex-direction: column; gap: 0.8rem; margin: 0.5rem 0; }

        .edit-input {
            background: rgba(255,255,255,0.03); border: 1px solid var(--card-border);
            border-radius: 6px; color: white; padding: 0.8rem; font-family: inherit; font-size: 0.85rem;
        }

        .edit-input:focus { border-color: var(--primary); outline: none; background: rgba(255,255,255,0.06); }

        .published-at { color: var(--muted); font-size: 0.65rem; margin-top: auto; }

        .management-controls { display: flex; gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--card-border); }

        .publish-btn, .hide-btn, .edit-toggle-btn {
            padding: 0.7rem 1.2rem; border-radius: 8px; font-size: 0.65rem;
            font-weight: 800; letter-spacing: 1px; cursor: pointer;
            transition: all 0.2s ease; display: flex; align-items: center; gap: 0.6rem; border: none;
        }

        .publish-btn { background: #1877f2; color: white; }
        .publish-btn:hover:not(:disabled) { background: #166fe5; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(24, 119, 242, 0.4); }

        .edit-toggle-btn { background: rgba(255, 62, 62, 0.1); color: var(--primary); border: 1px solid rgba(255, 62, 62, 0.2); }
        .edit-toggle-btn:hover { background: var(--primary); color: white; }

        .hide-btn { background: var(--glass); border: 1px solid var(--card-border); color: var(--muted); }
        .hide-btn:hover { color: var(--foreground); background: var(--glass-hover); border-color: rgba(255,255,255,0.2); }

        @media (max-width: 768px) {
            .card-main-content { flex-direction: column; }
            .card-image-wrapper { width: 100%; height: 200px; }
            .management-controls { flex-wrap: wrap; }
            .publish-btn, .hide-btn, .edit-toggle-btn { flex: 1; justify-content: center; }
        }
      `}} />
        </div>
    );
}
