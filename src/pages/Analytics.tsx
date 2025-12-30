import { useState, useEffect } from 'react';
import { rtdb } from '../utils/firebase';
import { ref, query, orderByChild, startAt, get } from 'firebase/database';
import './Analytics.css';

interface PageView {
    page: string;
    timestamp: number;
    sessionId: string;
    referrer: string;
    duration?: number;
}

interface Session {
    lastPage: string;
    lastSeen: number;
    referrer: string;
}

interface AnalyticsData {
    pageViews: Record<string, PageView>;
    sessions: Record<string, Session>;
    totalPageViews?: number;
    uniqueVisitors?: number;
    visitors?: Record<string, { firstVisit: number; lastVisit: number; visitCount: number }>;
}

const TIME_RANGES = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
};

export default function Analytics() {
    const [data, setData] = useState<AnalyticsData>({ pageViews: {}, sessions: {} });
    const [timeRange, setTimeRange] = useState<keyof typeof TIME_RANGES>('24h');
    const [loading, setLoading] = useState(true);

    // Fetch analytics data
    useEffect(() => {
        if (!rtdb) return;

        const fetchData = async () => {
            setLoading(true);
            const cutoffTime = Date.now() - TIME_RANGES[timeRange];

            try {
                // Fetch global metrics (existing format)
                const analyticsRef = ref(rtdb, 'analytics');
                const analyticsSnapshot = await get(analyticsRef);
                const analyticsData = analyticsSnapshot.val() || {};

                // Fetch page views (new format)
                const pageViewsRef = ref(rtdb, 'analytics/pageViews');
                const pageViewsQuery = query(pageViewsRef, orderByChild('timestamp'), startAt(cutoffTime));
                const pageViewsSnapshot = await get(pageViewsQuery);
                const pageViews = pageViewsSnapshot.val() || {};

                // Fetch sessions (new format)
                const sessionsRef = ref(rtdb, 'analytics/sessions');
                const sessionsQuery = query(sessionsRef, orderByChild('lastSeen'), startAt(cutoffTime));
                const sessionsSnapshot = await get(sessionsQuery);
                const sessions = sessionsSnapshot.val() || {};

                // Fetch visitors (existing format)
                const visitorsRef = ref(rtdb, 'analytics/visitors');
                const visitorsSnapshot = await get(visitorsRef);
                const visitors = visitorsSnapshot.val() || {};

                setData({
                    pageViews,
                    sessions,
                    totalPageViews: analyticsData.totalPageViews || 0,
                    uniqueVisitors: analyticsData.uniqueVisitors || 0,
                    visitors
                });
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [timeRange]);

    // Calculate metrics
    const pageViewsArray = Object.values(data.pageViews);
    const sessionsArray = Object.values(data.sessions);
    const visitorsArray = Object.values(data.visitors || {});

    // Use existing global metrics if available, otherwise calculate from new format
    const totalPageViews = data.totalPageViews || pageViewsArray.length;
    const uniqueVisitors = data.uniqueVisitors || sessionsArray.length;

    // Top pages
    const pageCount: Record<string, number> = {};
    pageViewsArray.forEach(pv => {
        pageCount[pv.page] = (pageCount[pv.page] || 0) + 1;
    });
    const topPages = Object.entries(pageCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    // Traffic sources
    const sourceCount: Record<string, number> = {};
    sessionsArray.forEach(session => {
        sourceCount[session.referrer] = (sourceCount[session.referrer] || 0) + 1;
    });
    const topSources = Object.entries(sourceCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    // Average session duration
    const durationsWithValue = pageViewsArray.filter(pv => pv.duration && pv.duration > 0);
    const avgDuration = durationsWithValue.length > 0
        ? Math.round(durationsWithValue.reduce((sum, pv) => sum + (pv.duration || 0), 0) / durationsWithValue.length)
        : 0;

    // Active visitors (in last 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const activeVisitors = sessionsArray.filter(s => s.lastSeen > fiveMinutesAgo).length;

    return (
        <div className="analytics-page">
            <div className="analytics-header">
                <h1>📊 Analytics Dashboard</h1>
                <div className="time-range-selector">
                    {(Object.keys(TIME_RANGES) as Array<keyof typeof TIME_RANGES>).map(range => (
                        <button
                            key={range}
                            className={timeRange === range ? 'active' : ''}
                            onClick={() => setTimeRange(range)}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading analytics...</div>
            ) : (
                <>
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <div className="metric-icon">👥</div>
                            <div className="metric-value">{uniqueVisitors}</div>
                            <div className="metric-label">Unique Visitors</div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">📄</div>
                            <div className="metric-value">{totalPageViews}</div>
                            <div className="metric-label">Page Views</div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">🟢</div>
                            <div className="metric-value">{activeVisitors}</div>
                            <div className="metric-label">Active Now</div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">⏱️</div>
                            <div className="metric-value">{avgDuration}s</div>
                            <div className="metric-label">Avg Duration</div>
                        </div>
                    </div>

                    <div className="analytics-tables">
                        <div className="table-container">
                            <h2>📑 Top Pages</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Page</th>
                                        <th>Views</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topPages.length > 0 ? (
                                        topPages.map(([page, count]) => (
                                            <tr key={page}>
                                                <td>{page}</td>
                                                <td>{count}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2}>No data yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="table-container">
                            <h2>🌐 Traffic Sources</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Source</th>
                                        <th>Visitors</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topSources.length > 0 ? (
                                        topSources.map(([source, count]) => (
                                            <tr key={source}>
                                                <td>{source}</td>
                                                <td>{count}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2}>No data yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
