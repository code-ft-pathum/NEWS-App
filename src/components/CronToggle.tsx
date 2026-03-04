"use client";

import { useState, useEffect } from "react";
import { toggleCronStatus } from "@/app/actions/db";
import "./CronToggle.css";

// Placeholder for cron schedule - in real implementation, fetch from server
const CRON_SCHEDULE = [
    { hour: 0, minute: 15, name: "Midnight" },
    { hour: 6, minute: 42, name: "Morning" },
    { hour: 12, minute: 30, name: "Noon" },
    { hour: 18, minute: 5, name: "Evening" }
];

export default function CronToggle({ initialStatus }: { initialStatus: boolean }) {
    const [isEnabled, setIsEnabled] = useState(initialStatus);
    const [loading, setLoading] = useState(false);
    const [showSchedule, setShowSchedule] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        try {
            const newStatus = await toggleCronStatus();
            setIsEnabled(newStatus);
        } catch (error) {
            console.error("Toggle error:", error);
            alert("Failed to toggle cron job");
        } finally {
            setLoading(false);
        }
    };

    // Format time for display
    const formatTime = (hour: number, minute: number) => {
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    };

    return (
        <div className="cron-toggle-wrapper">
            <div className="cron-toggle-header">
                <label className="cron-label">AUTO-PUBLISH</label>
                <div className="toggle-control">
                    <button 
                        onClick={handleToggle}
                        disabled={loading}
                        className={`toggle-switch ${isEnabled ? 'active' : ''}`}
                        aria-label={`Toggle auto-publish ${isEnabled ? 'off' : 'on'}`}
                        title={isEnabled ? 'Disable auto-publish' : 'Enable auto-publish'}
                    >
                        <span className="toggle-knob"></span>
                    </button>
                    <span className={`status-text ${isEnabled ? 'enabled' : 'disabled'}`}>
                        {loading ? 'Updating...' : (isEnabled ? 'Enabled' : 'Disabled')}
                    </span>
                </div>
            </div>

            <div className="cron-schedule-section">
                <button
                    className="schedule-toggle-btn"
                    onClick={() => setShowSchedule(!showSchedule)}
                    title="View scheduling details"
                >
                    <span className="schedule-label">
                        {isEnabled ? '📅 Publishing Schedule' : '📅 Schedule (Inactive)'}
                    </span>
                    <span className={`chevron ${showSchedule ? 'open' : ''}`}>
                        ▾
                    </span>
                </button>

                {showSchedule && (
                    <div className="schedule-details">
                        <div className="schedule-grid">
                            {CRON_SCHEDULE.map((slot, idx) => (
                                <div key={idx} className="schedule-item">
                                    <span className="time">{formatTime(slot.hour, slot.minute)}</span>
                                    <span className={`label ${!isEnabled ? 'inactive' : ''}`}>
                                        {slot.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className="schedule-note">
                            {isEnabled 
                                ? '✓ Auto-publish will run at these times'
                                : '○ Scheduling inactive - toggle to enable'}
                        </p>
                    </div>
                )}
            </div>

            <div className={`status-indicator ${isEnabled ? 'active' : ''}`}>
                <span className="dot"></span>
                <span className="status-msg">
                    {isEnabled ? 'Publishing on schedule' : 'Auto-publish disabled'}
                </span>
            </div>
        </div>
    );
}
