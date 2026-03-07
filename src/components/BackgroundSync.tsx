"use client";

import { useEffect } from "react";
import { checkAndPassiveSync } from "@/app/actions/automate";

export default function BackgroundSync() {
    useEffect(() => {
        // Run once on mount (client-side only) after a short delay
        const initialTimer = setTimeout(() => {
            checkAndPassiveSync()
                .then(res => {
                    if (res?.success) console.log("[AutoSync] Initial check complete:", res.message);
                })
                .catch(err => console.debug("[AutoSync] Initial check skipped."));
        }, 3000);

        // Then continue to check every 15 minutes (900,000 ms) automatically
        // as long as the website is open in the background
        const intervalTimer = setInterval(() => {
            console.log("[AutoSync] 15-minute interval reached, triggering sync...");
            checkAndPassiveSync()
                .then(res => {
                    if (res?.success) console.log("[AutoSync] Interval sync complete:", res.message);
                })
                .catch(err => console.debug("[AutoSync] Interval sync skipped."));
        }, 15 * 60 * 1000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(intervalTimer);
        };
    }, []);

    return null;
}
