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

        </div>
    );
}
