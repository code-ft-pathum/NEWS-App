"use client";

import { useEffect, useState } from "react";
import { getAutomationSettings } from "@/app/actions/db";
import { toggleAutomationStatus } from "@/app/actions/automate";
import "./CronToggle.css";

export default function CronToggle() {
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lastRun, setLastRun] = useState<string | null>(null);

    useEffect(() => {
        getAutomationSettings().then(settings => {
            setEnabled(settings.enabled || false);
            setLastRun(settings.lastRunAt);
            setLoading(false);
        });
    }, []);

    const handleToggle = async () => {
        setLoading(true);
        const newStatus = await toggleAutomationStatus();
        setEnabled(newStatus);
        setLoading(false);
    };

    return (
        <div className="cron-toggle-container">
            <div className="cron-info">
                <div className="cron-label">
                    <span className="pulse"></span>
                    AUTO-SYNC {enabled ? "ACTIVE" : "PAUSED"}
                </div>
                {lastRun && (
                    <div className="cron-subtext">
                        Last Run: {new Date(lastRun).toLocaleString()}
                    </div>
                )}
            </div>

            <button
                onClick={handleToggle}
                disabled={loading}
                className={`toggle-switch ${enabled ? "enabled" : "disabled"}`}
            >
                <div className="switch-knob"></div>
                <span className="toggle-text">{enabled ? "OFF" : "ON"}</span>
            </button>
        </div>
    );
}
