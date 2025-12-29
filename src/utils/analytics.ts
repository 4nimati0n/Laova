import { rtdb } from './firebase';
import { ref, get, set, increment, serverTimestamp, onValue } from 'firebase/database';

/**
 * Visitor Analytics System
 * 
 * Tracks unique visitors using localStorage fingerprint + Firebase RTDB
 * Stores: total unique visitors, daily visits, visitor log with timestamps
 */

const VISITOR_ID_KEY = 'laova_visitor_id';
const LAST_VISIT_KEY = 'laova_last_visit';

/**
 * Get or create a unique visitor ID
 */
function getVisitorId(): string {
    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
        visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }
    return visitorId;
}

/**
 * Get today's date key for daily stats (YYYY-MM-DD)
 */
function getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Track a page visit
 * - Increments total visit count
 * - Increments today's visit count
 * - Logs unique visitor if first visit
 * - Updates visitor's last seen timestamp
 */
export async function trackVisit(): Promise<void> {
    if (!rtdb) {
        console.warn('Firebase not initialized, skipping analytics');
        return;
    }

    try {
        const visitorId = getVisitorId();
        const todayKey = getTodayKey();
        const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
        const isNewDay = lastVisit !== todayKey;

        // Update last visit date locally
        localStorage.setItem(LAST_VISIT_KEY, todayKey);

        // Check if this is a new visitor
        const visitorRef = ref(rtdb, `analytics/visitors/${visitorId}`);
        const visitorSnapshot = await get(visitorRef);
        const isNewVisitor = !visitorSnapshot.exists();

        if (isNewVisitor) {
            // First time visitor - log them
            await set(visitorRef, {
                firstVisit: serverTimestamp(),
                lastVisit: serverTimestamp(),
                visitCount: 1
            });

            // Increment unique visitor count
            const uniqueCountRef = ref(rtdb, 'analytics/uniqueVisitors');
            await set(uniqueCountRef, increment(1));
        } else {
            // Returning visitor - update their record
            await set(ref(rtdb, `analytics/visitors/${visitorId}/lastVisit`), serverTimestamp());
            await set(ref(rtdb, `analytics/visitors/${visitorId}/visitCount`), increment(1));
        }

        // Always increment total page views
        const pageViewsRef = ref(rtdb, 'analytics/totalPageViews');
        await set(pageViewsRef, increment(1));

        // Increment daily stats if new day visit
        if (isNewDay) {
            const dailyRef = ref(rtdb, `analytics/daily/${todayKey}/visits`);
            await set(dailyRef, increment(1));

            if (isNewVisitor) {
                const dailyNewRef = ref(rtdb, `analytics/daily/${todayKey}/newVisitors`);
                await set(dailyNewRef, increment(1));
            }
        }

        console.log(`[Analytics] Visit tracked: ${isNewVisitor ? 'NEW' : 'returning'} visitor`);
    } catch (error) {
        console.error('[Analytics] Error tracking visit:', error);
    }
}

/**
 * Analytics stats structure
 */
export interface AnalyticsStats {
    uniqueVisitors: number;
    totalPageViews: number;
    todayVisits: number;
    todayNewVisitors: number;
}

/**
 * Get current analytics stats (one-time fetch)
 */
export async function getAnalyticsStats(): Promise<AnalyticsStats> {
    if (!rtdb) {
        return { uniqueVisitors: 0, totalPageViews: 0, todayVisits: 0, todayNewVisitors: 0 };
    }

    try {
        const todayKey = getTodayKey();

        const [uniqueSnap, pageViewsSnap, dailySnap] = await Promise.all([
            get(ref(rtdb, 'analytics/uniqueVisitors')),
            get(ref(rtdb, 'analytics/totalPageViews')),
            get(ref(rtdb, `analytics/daily/${todayKey}`))
        ]);

        const dailyData = dailySnap.val() || {};

        return {
            uniqueVisitors: uniqueSnap.val() || 0,
            totalPageViews: pageViewsSnap.val() || 0,
            todayVisits: dailyData.visits || 0,
            todayNewVisitors: dailyData.newVisitors || 0
        };
    } catch (error) {
        console.error('[Analytics] Error fetching stats:', error);
        return { uniqueVisitors: 0, totalPageViews: 0, todayVisits: 0, todayNewVisitors: 0 };
    }
}

/**
 * Subscribe to real-time analytics updates
 */
export function subscribeToAnalytics(callback: (stats: AnalyticsStats) => void): () => void {
    if (!rtdb) {
        callback({ uniqueVisitors: 0, totalPageViews: 0, todayVisits: 0, todayNewVisitors: 0 });
        return () => { };
    }

    const todayKey = getTodayKey();
    let stats: AnalyticsStats = { uniqueVisitors: 0, totalPageViews: 0, todayVisits: 0, todayNewVisitors: 0 };

    const unsubUnique = onValue(ref(rtdb, 'analytics/uniqueVisitors'), (snap) => {
        stats = { ...stats, uniqueVisitors: snap.val() || 0 };
        callback(stats);
    });

    const unsubPageViews = onValue(ref(rtdb, 'analytics/totalPageViews'), (snap) => {
        stats = { ...stats, totalPageViews: snap.val() || 0 };
        callback(stats);
    });

    const unsubDaily = onValue(ref(rtdb, `analytics/daily/${todayKey}`), (snap) => {
        const data = snap.val() || {};
        stats = { ...stats, todayVisits: data.visits || 0, todayNewVisitors: data.newVisitors || 0 };
        callback(stats);
    });

    return () => {
        unsubUnique();
        unsubPageViews();
        unsubDaily();
    };
}
