
import { useState, useEffect } from 'react';
import { rtdb as db } from '../utils/firebase';
import { ref, onValue } from 'firebase/database';
import { type HeroElementConfig } from './HeroEditor';
import GoldParticles from './GoldParticles';
import GoldShimmer from './GoldShimmer';
import ResponsiveFiller from './ResponsiveFiller';
import { useOrientation } from '../hooks/useOrientation';
import './landing.css';

// User defined default config
export const INITIAL_HERO_CONFIG: Record<string, HeroElementConfig> = {
    "counter": {
        "id": "counter",
        "name": "Spots Counter",
        "top": 90.5,
        "scale": 1.1,
        "depth": 0,
        "zIndex": 100
    },
    "cta": {
        "id": "cta",
        "name": "CTA Button",
        "top": 82,
        "scale": 0.1,
        "depth": 0,
        "zIndex": 100
    },
    "cta_animation": {
        "id": "cta_animation",
        "name": "CTA Animation",
        "loopScale": 1.04,
        "animSpeed": 4,
        // Default shadow (dark) - LOW state
        "defaultShadowSize": 9,
        "defaultShadowDistance": 2,
        "defaultShadowColor": "#250d0c",
        "defaultShadowAlpha": 60,
        // Default shadow HIGH state
        "defaultShadowSizeHigh": 62,
        "defaultShadowDistanceHigh": 28,
        // Gold glow - LOW state
        "shadowSize": 200,
        "shadowDistance": 0,
        "shadowColor": "#F9E49A",
        "shadowAlpha": 100,
        // Gold glow HIGH state
        "shadowSizeHigh": 86,
        "shadowDistanceHigh": 0,
        // Scroll config
        "scrollDuration": 2000,  // ms
        "scrollTarget": 335      // vh
    }
};

interface HeroProps {
    onOpenModal?: () => void;
    config?: Record<string, HeroElementConfig>; // Optional to fallback to default
}

export const Hero = ({ config: externalConfig }: HeroProps) => {
    const [spotsLeft, setSpotsLeft] = useState(47); // 34 + 13
    const orientation = useOrientation();
    // Use external config or fallback (though parent should drive this now)
    const config = externalConfig || INITIAL_HERO_CONFIG;

    // Fetch spots
    useEffect(() => {
        // If db is not initialized (offline), ignore
        if (!db) return;

        const countersRef = ref(db, 'counters/availableSpots');
        const unsubscribe = onValue(countersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Sum explorer and visionary spots
                const explorer = data.explorer !== undefined ? data.explorer : 34;
                const visionary = data.visionary !== undefined ? data.visionary : 13;
                setSpotsLeft(explorer + visionary);
            }
        });
        return () => unsubscribe();
    }, []);

    // Helper for absolute positioning of editable elements (CTA, Counter)
    const getStyle = (id: string) => {
        const item = config[id];
        if (!item) return {};

        return {
            position: 'absolute' as const,
            top: `${item.top}%`,
            left: '50%',
            transform: `translate(-50%, -50%) scale(${item.scale})`,
            zIndex: item.zIndex,
            textAlign: 'center' as const,
            pointerEvents: 'none' as const, // Editor wrapper usually none, children auto
        };
    };

    // Smooth scroll with ease-in-out curve
    const smoothScrollTo = (targetVh: number, duration: number) => {
        // Find the scrollable container (.landing-page)
        const container = document.querySelector('.landing-page');
        if (!container) {
            console.warn('Landing page container not found');
            return;
        }

        const targetY = (targetVh / 100) * window.innerHeight;
        const startY = container.scrollTop;
        const distance = targetY - startY;
        const startTime = performance.now();

        // Ease-in-out cubic
        const easeInOutCubic = (t: number) => {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const animateScroll = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeInOutCubic(progress);

            container.scrollTop = startY + distance * easedProgress;

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
    };

    // Handle CTA click - scroll to pricing
    const handleCtaClick = () => {
        const duration = config.cta_animation?.scrollDuration ?? 1500;
        const target = config.cta_animation?.scrollTarget ?? 420;
        smoothScrollTo(target, duration);
    };

    return (
        <section className="hero" style={{
            height: '100vh',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#0b0a09'
        }}>
            <ResponsiveFiller>
                {/* Editor moved to parent (Landing.tsx) */}

                {/* 1. Background Image - switches based on orientation */}
                <img
                    src={orientation === 'portrait' ? '/images/landing1-mobile.jpeg' : '/images/landing1.jpeg'}
                    className="hero-responsive-img"
                    style={{
                        zIndex: 1,
                        pointerEvents: 'none'
                    }}
                    alt="Laova Search"
                />

                {/* Gold Shimmer Overlay - amplifies gold tones */}
                <GoldShimmer />

                {/* Animated Gold Particles */}
                <GoldParticles />

                {/* 2. Counter */}
                <div style={getStyle('counter')} className="editable">
                    <p className="urgency" style={{ marginTop: 0, pointerEvents: 'auto' }}>
                        Only {spotsLeft} spots left
                    </p>
                </div>

                {/* 3. CTA Image Button */}
                <div style={getStyle('cta')} className="editable">
                    <div
                        className="cta-hover-wrapper"
                        style={{
                            pointerEvents: 'auto', // Enable clicks on this wrapper
                            // Default shadow (dark) - LOW state
                            '--default-shadow-size': `${config.cta_animation?.defaultShadowSize ?? 9}px`,
                            '--default-shadow-distance': `${config.cta_animation?.defaultShadowDistance ?? 2}px`,
                            '--default-shadow-color-rgb': ((hex: string) => {
                                const r = parseInt(hex.slice(1, 3), 16);
                                const g = parseInt(hex.slice(3, 5), 16);
                                const b = parseInt(hex.slice(5, 7), 16);
                                return `${r}, ${g}, ${b}`;
                            })(config.cta_animation?.defaultShadowColor ?? '#000000'),
                            '--default-shadow-alpha': (config.cta_animation?.defaultShadowAlpha ?? 60) / 100,
                            // Default shadow HIGH state
                            '--default-shadow-size-high': `${config.cta_animation?.defaultShadowSizeHigh ?? 62}px`,
                            '--default-shadow-distance-high': `${config.cta_animation?.defaultShadowDistanceHigh ?? 28}px`,
                            // Gold glow - LOW state
                            '--shadow-size': `${config.cta_animation?.shadowSize ?? 0}px`,
                            '--shadow-distance': `${config.cta_animation?.shadowDistance ?? 0}px`,
                            '--shadow-color-rgb': ((hex: string) => {
                                const r = parseInt(hex.slice(1, 3), 16);
                                const g = parseInt(hex.slice(3, 5), 16);
                                const b = parseInt(hex.slice(5, 7), 16);
                                return `${r}, ${g}, ${b}`;
                            })(config.cta_animation?.shadowColor ?? '#D4AF37'),
                            '--shadow-alpha': (config.cta_animation?.shadowAlpha ?? 0) / 100,
                            // Gold glow HIGH state
                            '--shadow-size-high': `${config.cta_animation?.shadowSizeHigh ?? 148}px`,
                            '--shadow-distance-high': `${config.cta_animation?.shadowDistanceHigh ?? 0}px`,
                            // Animation
                            '--anim-speed': `${config.cta_animation?.animSpeed ?? 4}s`,
                        } as React.CSSProperties}
                    >
                        <img
                            src="/btn-join-founding.png"
                            alt="Join the Founding 100"
                            onClick={handleCtaClick}
                            className="cta-image-trigger cta-heartbeat"
                            style={{
                                '--loop-scale': config.cta_animation?.loopScale ?? 1.03,
                                '--anim-speed': `${config.cta_animation?.animSpeed ?? 4}s`,
                                pointerEvents: 'auto',
                                cursor: 'pointer',
                                display: 'block',
                                width: 'auto',
                                height: 'auto',
                                margin: 0,
                                padding: 0,
                                userSelect: 'none'
                            } as React.CSSProperties}
                            draggable={false}
                        />
                    </div>
                </div>
            </ResponsiveFiller>
        </section>
    );
};

export default Hero;
