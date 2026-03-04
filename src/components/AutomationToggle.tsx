"use client";

import { useState, useEffect } from "react";
import { getAutomationSettings, updateAutomationSettings } from "@/app/actions/db";

export default function AutomationToggle() {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSettings() {
            const settings = await getAutomationSettings();
            setStatus(settings || { enabled: false });
            setLoading(false);
        }
        loadSettings();
    }, []);

    const handleToggle = async () => {
        setLoading(true);
        const newEnabled = !status?.enabled;
        const result = await updateAutomationSettings(newEnabled);
        if (result.success) {
            setStatus((prev: any) => ({ ...prev, enabled: newEnabled }));
        }
        setLoading(false);
    };

    if (loading && !status) return <div className="automation-loading">SYNCHRONIZING...</div>;

    const enabled = status?.enabled;

    return (
        <div className="automation-control status-item">
            <label>AUTO-PILOT MODE</label>
            <div className="toggle-wrapper">
                <button
                    onClick={handleToggle}
                    className={`toggle-btn ${enabled ? 'active' : ''}`}
                    disabled={loading}
                >
                    <div className="toggle-slider"></div>
                    <span className="toggle-text">{enabled ? "ENGAGED" : "OFFLINE"}</span>
                </button>
                <p className="toggle-hint">
                    {enabled
                        ? "System is posting news to Facebook at synchronized intervals."
                        : "Manual mode active. Automation is suspended."}
                </p>
                {status?.lastRunAt && (
                    <div className="last-run-info">
                        <label>SIGNAL STATUS</label>
                        <span className={`status-text ${status.lastRunStatus}`}>
                            {status.lastRunStatus?.toUpperCase()}
                            {status.lastRunMessage && ` - ${status.lastRunMessage}`}
                        </span>
                    </div>
                )}
                {enabled && (
                    <a
                        href="/api/cron/post-news"
                        target="_blank"
                        className="manual-trigger-link"
                    >
                        [ FORCE SYNC NOW ]
                    </a>
                )}
            </div>

        </div>
    );
}
