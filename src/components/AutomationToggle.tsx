"use client";

import { useState, useEffect } from "react";
import { getAutomationSettings, updateAutomationSettings } from "@/app/actions/db";

export default function AutomationToggle() {
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSettings() {
            const settings = await getAutomationSettings();
            setEnabled(settings?.enabled || false);
            setLoading(false);
        }
        loadSettings();
    }, []);

    const handleToggle = async () => {
        setLoading(true);
        const newStatus = !enabled;
        const result = await updateAutomationSettings(newStatus);
        if (result.success) {
            setEnabled(newStatus);
        }
        setLoading(false);
    };

    if (loading && !enabled) return <div className="automation-loading">SYNCHRONIZING...</div>;

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
            </div>

            <style jsx>{`
                .automation-control {
                    min-width: 250px;
                }
                .toggle-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 0.8rem;
                    margin-top: 0.5rem;
                }
                .toggle-btn {
                    position: relative;
                    width: 140px;
                    height: 38px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--card-border);
                    border-radius: 20px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    padding: 0 10px;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .toggle-btn.active {
                    background: rgba(46, 213, 115, 0.1);
                    border-color: #2ed573;
                    box-shadow: 0 0 15px rgba(46, 213, 115, 0.2);
                }
                .toggle-slider {
                    position: absolute;
                    left: 4px;
                    width: 30px;
                    height: 30px;
                    background: var(--muted);
                    border-radius: 50%;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .active .toggle-slider {
                    transform: translateX(102px);
                    background: #2ed573;
                    box-shadow: 0 0 10px #2ed573;
                }
                .toggle-text {
                    width: 100%;
                    text-align: center;
                    font-size: 0.65rem;
                    font-weight: 900;
                    letter-spacing: 1px;
                    color: var(--muted);
                    z-index: 1;
                    padding-left: 20px;
                }
                .active .toggle-text {
                    color: #2ed573;
                    padding-left: 0;
                    padding-right: 20px;
                }
                .toggle-hint {
                    font-size: 0.65rem;
                    color: var(--muted);
                    line-height: 1.4;
                    max-width: 200px;
                }
                .automation-loading {
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: var(--primary);
                    letter-spacing: 2px;
                }
            `}</style>
        </div>
    );
}
