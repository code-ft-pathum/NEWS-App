"use client";

import { useState } from "react";
import { toggleAutomationStatus } from "@/app/actions/db";

export default function AutomationToggle({ initialStatus }: { initialStatus: boolean }) {
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        try {
            const newStatus = await toggleAutomationStatus();
            setStatus(newStatus);
        } catch (error) {
            console.error("Toggle error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="automation-toggle">
            <h2>AUTO-PILOT MODE</h2>
            <button 
                onClick={handleToggle} 
                disabled={loading}
                className={`status-btn ${status ? 'engaged' : 'offline'}`}
            >
                {status ? '✓ ENGAGED' : '⊗ OFFLINE'}
            </button>
            <p className="status-text">
                {status 
                    ? 'Automation is active. Posts will be published automatically.' 
                    : 'Manual mode active. Automation is suspended.'}
            </p>
        </div>
    );
}
