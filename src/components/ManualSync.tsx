"use client";

import { useState } from "react";
import { syncAllCategories } from "@/app/actions/automate";
import "./ManualSync.css";

export default function ManualSync() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [progress, setProgress] = useState<string[]>([]);

    // Stop syncing after X posts to avoid rate-limiting Facebook
    const MAX_POSTS_PER_SYNC = 5;

    const startSync = async () => {
        if (isSyncing) return;

        setIsSyncing(true);
        setProgress(["Starting bulk sync across all categories..."]);

        try {
            const result = await syncAllCategories();

            if (result.success) {
                if (result.details && result.details.length > 0) {
                    setProgress(prev => [...prev, ...result.details!]);
                }
                setProgress(prev => [...prev, `✅ ${result.message}`]);
            } else {
                setProgress(prev => [...prev, `❌ Error: ${result.message}`]);
            }
        } catch (err: any) {
            setProgress(prev => [...prev, `❌ Critical Error: ${err.message}`]);
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
                <i className="fa-solid fa-circle-info"></i> Scans all categories and syncs unposted articles to Facebook.
            </p>
        </div>
    );
}
