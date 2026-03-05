"use client";

import { useEffect } from "react";
import { checkAndPassiveSync } from "@/app/actions/automate";

export default function BackgroundSync() {
    useEffect(() => {
        // Run once on mount (client-side only)
        // We wrap it in a short delay so it doesn't compete with the main page load
        const timer = setTimeout(() => {
            checkAndPassiveSync()
                .then(res => {
                    if (res.success) {
                        console.log("[AutoSync] Background update complete:", res.message);
                    }
                })
                .catch(err => {
                    // Fail silently to the user
                    console.debug("[AutoSync] Background check skipped.");
                });
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    // This component renders nothing
    return null;
}
