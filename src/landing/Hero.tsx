
import { useState, useEffect } from 'react';
import { rtdb as db } from '../utils/firebase';
import { ref, onValue } from 'firebase/database';
import { type HeroElementConfig } from './HeroEditor';
import GoldParticles from './GoldParticles';
import GoldShimmer from './GoldShimmer';
import { useOrientation } from '../hooks/useOrientation';
import { useContainerScale } from '../hooks/useContainerScale';
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
    const scale = useContainerScale(); // Proportional scaling based on 1410x831 reference
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
    // Applies proportional scaling based on container size vs reference (1410x831)
    const getStyle = (id: string) => {
        const item = config[id];
        if (!item) return {};

        // Scale the scale value proportionally
        // Apply 3.0x multiplier on mobile (portrait)
        const mobileMultiplier = orientation === 'portrait' ? 3.0 : 1.0;
        const scaledScale = (item.scale ?? 1) * scale.uniform * mobileMultiplier;

        return {
            position: 'absolute' as const,
            top: `${item.top}%`, // Percentage stays the same
            left: '50%',
            transform: `translate(-50%, -50%) scale(${scaledScale})`,
            zIndex: item.zIndex,
            textAlign: 'center' as const,
            pointerEvents: 'none' as const, // Editor wrapper usually none, children auto
        };
    };

    // Handle CTA click - scroll to pricing
    const handleCtaClick = () => {
        const scrollToY = (config.cta_animation?.scrollTarget ?? 335) * (window.innerHeight / 100);

        // Custom smooth scroll implementation
        const startY = document.querySelector('.filler-frame-content')?.scrollTop || 0;
        const distance = scrollToY - startY;
        const duration = config.cta_animation?.scrollDuration ?? 2000; // ms
        const startTime = performance.now();

        const easeInOutQuad = (t: number) => {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        };

        const animateScroll = (currentTime: number) => {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = easeInOutQuad(progress);

            const container = document.querySelector('.filler-frame-content');
            if (container) {
                container.scrollTop = startY + (distance * ease);
            }

            if (timeElapsed < duration) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
    };

    return (
        <section className="hero" style={{
            height: 'var(--content-height, 100vh)',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#0b0a09'
        }}>
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
                        // Default shadow (dark) - LOW state (scaled)
                        '--default-shadow-size': `${(config.cta_animation?.defaultShadowSize ?? 9) * scale.uniform * (orientation === 'portrait' ? 3.0 : 1.0)}px`,
                        '--default-shadow-distance': `${(config.cta_animation?.defaultShadowDistance ?? 2) * scale.uniform * (orientation === 'portrait' ? 3.0 : 1.0)}px`,
                        '--default-shadow-color-rgb': ((hex: string) => {
                            const r = parseInt(hex.slice(1, 3), 16);
                            const g = parseInt(hex.slice(3, 5), 16);
                            const b = parseInt(hex.slice(5, 7), 16);
                            return `${r}, ${g}, ${b}`;
                        })(config.cta_animation?.defaultShadowColor ?? '#000000'),
                        '--default-shadow-alpha': (config.cta_animation?.defaultShadowAlpha ?? 60) / 100,
                        // Default shadow HIGH state (scaled)
                        '--default-shadow-size-high': `${(config.cta_animation?.defaultShadowSizeHigh ?? 62) * scale.uniform * (orientation === 'portrait' ? 3.0 : 1.0)}px`,
                        '--default-shadow-distance-high': `${(config.cta_animation?.defaultShadowDistanceHigh ?? 28) * scale.uniform * (orientation === 'portrait' ? 3.0 : 1.0)}px`,
                        // Gold glow - LOW state (scaled)
                        '--shadow-size': `${(config.cta_animation?.shadowSize ?? 0) * scale.uniform * (orientation === 'portrait' ? 3.0 : 1.0)}px`,
                        '--shadow-distance': `${(config.cta_animation?.shadowDistance ?? 0) * scale.uniform * (orientation === 'portrait' ? 3.0 : 1.0)}px`,
                        '--shadow-color-rgb': ((hex: string) => {
                            const r = parseInt(hex.slice(1, 3), 16);
                            const g = parseInt(hex.slice(3, 5), 16);
                            const b = parseInt(hex.slice(5, 7), 16);
                            return `${r}, ${g}, ${b}`;
                        })(config.cta_animation?.shadowColor ?? '#D4AF37'),
                        '--shadow-alpha': (config.cta_animation?.shadowAlpha ?? 0) / 100,
                        // Gold glow HIGH state (scaled)
                        '--shadow-size-high': `${(config.cta_animation?.shadowSizeHigh ?? 148) * scale.uniform * (orientation === 'portrait' ? 3.0 : 1.0)}px`,
                        '--shadow-distance-high': `${(config.cta_animation?.shadowDistanceHigh ?? 0) * scale.uniform * (orientation === 'portrait' ? 3.0 : 1.0)}px`,
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
        </section>
    );
};

export default Hero;
