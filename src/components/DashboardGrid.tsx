"use client";

import { Article } from "@/lib/news";
import { publishToFacebook } from "@/app/actions/facebook";
import { checkBulkPublished, saveToPublished, testFirebaseConnection } from "@/app/actions/db";
import { useState, useEffect } from "react";

interface DashboardGridProps {
    articles: Article[];
    category?: string;
}

export default function DashboardGrid({ articles: initialArticles, category = 'general' }: DashboardGridProps) {
    const [articles, setArticles] = useState<Article[]>(initialArticles);
    const [publishedUrls, setPublishedUrls] = useState<Set<string>>(new Set());
    const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [editingArticle, setEditingArticle] = useState<string | null>(null);

    // Track local edits
    const [editData, setEditData] = useState<Record<string, { title: string, description: string }>>({});
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        testFirebaseConnection().then(res => {
            console.log("[DashboardGrid] Firebase Connection Test:", res);
        });
    }, []);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const urls = articles.map(a => a.url);
                if (urls.length === 0) return;

                console.log("[DashboardGrid] Checking status for", urls.length, "articles");
                const published = await checkBulkPublished(urls);
                console.log("[DashboardGrid] Found", published.length, "already published");

                setPublishedUrls(new Set(published));
            } catch (err) {
                console.error("[DashboardGrid] Error checking publication status:", err);
            }
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
            // Step 1: Publish to Facebook
            console.log("[Publish] Publishing to Facebook...");
            const result = await publishToFacebook({
                title: finalTitle,
                url: article.url,
                description: finalDesc,
                urlToImage: article.urlToImage,
            });

            if (!result.success) {
                setErrorMsg("Failed to publish to Facebook");
                return;
            }

            console.log("[Publish] Facebook published successfully, FB Post ID:", result.postId);

            // Step 2: Save to Firebase
            console.log("[Publish] Saving to Firebase...");
            const dbResult = await saveToPublished({
                title: finalTitle,
                url: article.url,
                fbPostId: result.postId,
                category: category
            });

            if (!dbResult.success) {
                setErrorMsg(`Published to Facebook but failed to save: ${dbResult.error}`);
                return;
            }

            console.log("[Publish] Successfully saved to Firebase");

            // Step 3: Update UI
            setPublishedUrls(prev => new Set([...prev, id]));
            setSuccessMsg(`✓ Published & Saved! Post ID: ${result.postId}`);
            setEditingArticle(null);
        } catch (error: any) {
            console.error("[Publish] Error:", error);
            setErrorMsg(`Error: ${error.message}`);
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

                                    <p className="published-at">
                                        {isMounted ? new Date(article.publishedAt).toLocaleString() : "Loading date..."}
                                    </p>
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
