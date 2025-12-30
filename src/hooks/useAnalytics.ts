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

// Get UTM parameters from URL
function getUTMParams(): Record<string, string> {
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};

    const source = params.get('utm_source');
    const medium = params.get('utm_medium');
    const campaign = params.get('utm_campaign');

    if (source) utm.source = source;
    if (medium) utm.medium = medium;
    if (campaign) utm.campaign = campaign;

    return utm;
}

// Get geolocation data (cached in sessionStorage)
async function getGeolocation(): Promise<{ country?: string; city?: string } | null> {
    // Check cache first
    const cached = sessionStorage.getItem('analytics_geo');
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch {
            // Invalid cache, continue
        }
    }

    try {
        // Using ip-api.com (unlimited free, no auth required)
        const response = await fetch('http://ip-api.com/json/');
        if (!response.ok) return null;

        const data = await response.json();
        const geo = {
            country: data.country || undefined,
            city: data.city || undefined,
        };

        // Cache for session
        sessionStorage.setItem('analytics_geo', JSON.stringify(geo));
        return geo;
    } catch (error) {
        console.warn('Geolocation fetch failed:', error);
        return null;
    }
}

// Detect device type
function getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'mobile';
    }
    return 'desktop';
}

export function useAnalytics(pageName: string) {
    const entryTime = useRef<number>(Date.now());
    const pageViewRef = useRef<string | null>(null);

    useEffect(() => {
        if (!rtdb) return;

        const sessionId = getSessionId();
        const referrer = getReferrer();
        const utm = getUTMParams();
        const deviceType = getDeviceType();
        entryTime.current = Date.now();

        // Fetch geo and record page view
        (async () => {
            const geo = await getGeolocation();

            // Record page view
            const pageViewsRef = ref(rtdb, 'analytics/pageViews');
            const newPageViewRef = push(pageViewsRef);
            pageViewRef.current = newPageViewRef.key;

            const dataToWrite: any = {
                sessionId,
                page: pageName,
                timestamp: serverTimestamp(),
                referrer,
                userAgent: navigator.userAgent,
                deviceType,
            };

            if (geo) dataToWrite.geo = geo;
            if (Object.keys(utm).length > 0) dataToWrite.utm = utm;

            set(newPageViewRef, dataToWrite).catch(err => console.error('Analytics tracking error:', err));

            const sessionData: any = {
                lastPage: pageName,
                lastSeen: serverTimestamp(),
                referrer,
                deviceType,
            };

            if (geo) sessionData.geo = geo;
            if (Object.keys(utm).length > 0) sessionData.utm = utm;

            set(sessionRef, sessionData).catch(err => console.error('Session tracking error:', err));
        })();

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
