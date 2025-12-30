import { useEffect } from 'react';
import { rtdb } from '../utils/firebase';
import { ref, push, set, serverTimestamp } from 'firebase/database';

// Track conversion events (scroll to pricing, CTA click, modal open)
export function trackConversionEvent(
    eventType: 'scroll_to_pricing' | 'cta_click' | 'modal_open',
    metadata?: { tier?: 'explorer' | 'visionary' }
) {
    if (!rtdb) return;

    const sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) return;

    const eventsRef = ref(rtdb, 'analytics/conversionEvents');
    const newEventRef = push(eventsRef);

    const eventData: any = {
        sessionId,
        eventType,
        timestamp: serverTimestamp(),
    };

    if (metadata) eventData.metadata = metadata;

    set(newEventRef, eventData).catch(err => console.error('Conversion event tracking error:', err));
}

// Hook to track scroll to pricing section
export function useScrollTracking(targetElementId: string, eventType: 'scroll_to_pricing') {
    useEffect(() => {
        let tracked = false;

        const handleScroll = () => {
            if (tracked) return;

            const element = document.getElementById(targetElementId);
            if (!element) return;

            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

            if (isVisible) {
                trackConversionEvent(eventType);
                tracked = true;
                window.removeEventListener('scroll', handleScroll);
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Check immediately in case already visible
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [targetElementId, eventType]);
}
