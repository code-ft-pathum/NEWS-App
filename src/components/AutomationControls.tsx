"use client";

import { useEffect, useState } from "react";
import { getAutomationSettings } from "@/app/actions/db";
import { toggleAutomationStatus, toggleEnhanceStatus } from "@/app/actions/automate";
import "./AutomationControls.css";

export default function AutomationControls() {
    const [automationEnabled, setAutomationEnabled] = useState(false);
    const [enhanceEnabled, setEnhanceEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lastRun, setLastRun] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            const settings = await getAutomationSettings();
            setAutomationEnabled(settings.enabled || false);
            setEnhanceEnabled(settings.enhanceEnabled || false);
            setLastRun(settings.lastRunAt);
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleToggleAutomation = async () => {
        setLoading(true);
        const newStatus = await toggleAutomationStatus();
        setAutomationEnabled(newStatus);
        setLoading(false);
    };

    const handleToggleEnhance = async () => {
        setLoading(true);
        const newStatus = await toggleEnhanceStatus();
        setEnhanceEnabled(newStatus);
        setLoading(false);
    };

    return (
        <div className="automation-controls-container">
            {/* Automation Toggle */}
            <div className="control-card">
                <div className="control-info">
                    <div className="control-label">
                        <span className={`pulse ${automationEnabled ? "active" : ""}`}></span>
                        AUTOMATION {automationEnabled ? "ACTIVE" : "PAUSED"}
                    </div>
                    {lastRun && (
                        <div className="control-subtext">
                            Last Run: {new Date(lastRun).toLocaleString()}
                        </div>
                    )}
                </div>
                <button
                    onClick={handleToggleAutomation}
                    disabled={loading}
                    className={`control-switch ${automationEnabled ? "enabled" : "disabled"}`}
                    title={automationEnabled ? "Disable Automation" : "Enable Automation"}
                >
                    <div className="switch-knob"></div>
                    <span className="switch-text">{automationEnabled ? "OFF" : "ON"}</span>
                </button>
            </div>

            {/* AI Enhancement Toggle */}
            <div className="control-card highlight">
                <div className="control-info">
                    <div className="control-label ai-label">
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                        AI ENHANCEMENT {enhanceEnabled ? "ON" : "OFF"}
                    </div>
                    <div className="control-subtext">
                        Auto-enrich with Emojis & Hashtags
                    </div>
                </div>
                <button
                    onClick={handleToggleEnhance}
                    disabled={loading}
                    className={`control-switch ${enhanceEnabled ? "enabled-ai" : "disabled"}`}
                    title={enhanceEnabled ? "Disable AI Enhancement" : "Enable AI Enhancement"}
                >
                    <div className="switch-knob"></div>
                    <span className="switch-text">{enhanceEnabled ? "OFF" : "ON"}</span>
                </button>
            </div>
        </div>
    );
}
