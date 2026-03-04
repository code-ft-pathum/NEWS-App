"use client";

import { useState } from "react";
import { triggerAutomation } from "@/app/actions/automate";
import "./ManualSync.css";

export default function ManualSync() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [progress, setProgress] = useState<string[]>([]);

    // Stop syncing after X posts to avoid rate-limiting Facebook
    const MAX_POSTS_PER_SYNC = 5;

    const startSync = async () => {
        if (isSyncing) return;

        setIsSyncing(true);
        setProgress(["Starting sync sequence..."]);

        let postsDone = 0;
        let keepSyncing = true;

        while (keepSyncing && postsDone < MAX_POSTS_PER_SYNC) {
            try {
                // Call the server action to find and post ONE unpublished article
                const result = await triggerAutomation();

                if (result.success) {
                    postsDone++;
                    setProgress(prev => [...prev.slice(-3), `✅ ${result.message}`]);

                    // Wait 3 seconds before the next post to avoid spamming the API
                    if (postsDone < MAX_POSTS_PER_SYNC) {
                        setProgress(prev => [...prev.slice(-3), "Waiting 3s before next post..."]);
                        await new Promise(res => setTimeout(res, 3000));
                    }
                } else {
                    // No more articles, or Facebook error
                    if (result.message === "All fetched articles already published") {
                        setProgress(prev => [...prev.slice(-3), "🏁 All news from this batch is synced."]);
                    } else {
                        setProgress(prev => [...prev.slice(-3), `❌ Stopped: ${result.message}`]);
                    }
                    keepSyncing = false;
                }
            } catch (err: any) {
                setProgress(prev => [...prev.slice(-3), `❌ Error: ${err.message}`]);
                keepSyncing = false;
            }
        }

        if (postsDone === MAX_POSTS_PER_SYNC) {
            setProgress(prev => [...prev.slice(-3), "⏸️ Batch limit reached. Click again to continue."]);
        }

        setIsSyncing(false);
    };

    return (
        <div className="manual-sync-wrapper">
            <div className="manual-sync-header">
                <label className="sync-label">MANUAL SYNC</label>
                <button
                    onClick={startSync}
                    disabled={isSyncing}
                    className={`sync-btn ${isSyncing ? 'syncing' : ''}`}
                >
                    {isSyncing ? (
                        <><i className="fa-solid fa-spinner fa-spin"></i> SYNCING...</>
                    ) : (
                        <><i className="fa-solid fa-rotate"></i> SYNC TO WEB</>
                    )}
                </button>
            </div>

            <div className="sync-logs">
                {progress.length === 0 ? (
                    <div className="log-empty">System ready. Waiting for manual sync.</div>
                ) : (
                    progress.map((msg, i) => (
                        <div key={i} className="log-entry slide-in">{msg}</div>
                    ))
                )}
            </div>

            <p className="sync-hint">
                <i className="fa-solid fa-circle-info"></i> Syncs up to {MAX_POSTS_PER_SYNC} missing articles at a time to prevent API rate limits.
            </p>
        </div>
    );
}
