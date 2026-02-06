"use client";

import { useEffect } from 'react';

export function useSessionCleanup() {
    useEffect(() => {
        const handleUnload = () => {
            // Use beacon for reliable execution on unload
            const blob = new Blob([JSON.stringify({ logout: true })], { type: 'application/json' });
            navigator.sendBeacon('/api/auth/logout', blob);
        };

        window.addEventListener('pagehide', handleUnload);
        // Legacy support for some browsers
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            window.removeEventListener('pagehide', handleUnload);
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, []);
}
