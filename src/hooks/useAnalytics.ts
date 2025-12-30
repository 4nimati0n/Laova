import { useEffect, useRef } from 'react';
import { rtdb } from '../utils/firebase';
import { ref, push, set, serverTimestamp } from 'firebase/database';

// Generate or retrieve session ID
function getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
}

// Get referrer (where user came from)
function getReferrer(): string {
    const referrer = document.referrer;
    if (!referrer || referrer.includes(window.location.hostname)) {
        return 'direct';
    }
    try {
        const url = new URL(referrer);
        return url.hostname;
    } catch {
        return 'unknown';
    }
}

export function useAnalytics(pageName: string) {
    const entryTime = useRef<number>(Date.now());
    const pageViewRef = useRef<string | null>(null);

    useEffect(() => {
        if (!rtdb) return;

        const sessionId = getSessionId();
        const referrer = getReferrer();
        entryTime.current = Date.now();

        // Record page view
        const pageViewsRef = ref(rtdb, 'analytics/pageViews');
        const newPageViewRef = push(pageViewsRef);
        pageViewRef.current = newPageViewRef.key;

        set(newPageViewRef, {
            sessionId,
            page: pageName,
            timestamp: serverTimestamp(),
            referrer,
            userAgent: navigator.userAgent,
        }).catch(err => console.error('Analytics tracking error:', err));

        // Update session
        const sessionRef = ref(rtdb, `analytics/sessions/${sessionId}`);
        set(sessionRef, {
            lastPage: pageName,
            lastSeen: serverTimestamp(),
            referrer,
        }).catch(err => console.error('Session tracking error:', err));

        // Cleanup: track duration when leaving page
        return () => {
            if (!pageViewRef.current) return;
            const duration = Math.floor((Date.now() - entryTime.current) / 1000); // in seconds
            const durationRef = ref(rtdb, `analytics/pageViews/${pageViewRef.current}/duration`);
            set(durationRef, duration).catch(() => {
                // Ignore errors on page unload
            });
        };
    }, [pageName]);
}
