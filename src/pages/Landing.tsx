import { useState, useEffect, useRef } from 'react';
import '../landing/landing.css';
import HeroEditor, { type HeroElementConfig } from '../landing/HeroEditor';
import Hero, { INITIAL_HERO_CONFIG } from '../landing/Hero';
// import Pricing from '../landing/Pricing'; // Removed until needed
import Footer from '../landing/Footer';
import CheckoutModal from '../landing/CheckoutModal';

// Initial Banner Config (Editable)
const INITIAL_BANNER_CONFIG: Record<string, HeroElementConfig> = {
    landing2: {
        id: 'landing2',
        name: 'Banner 2 (L2) Offset',
        offset: 91 // vh
    },
    landing4: {
        id: 'landing4',
        name: 'Spacer before L4',
        offset: 76 // vh
    },
    landing6: {
        id: 'landing6',
        name: 'Spacer before L6',
        offset: 94 // vh
    },
    landing6_bottom: {
        id: 'landing6_bottom',
        name: 'Spacer AFTER L6',
        offset: 3 // vh
    },
    pricing_buttons: {
        id: 'pricing_buttons',
        name: 'Pricing Buttons',
        top: 81.5, // % from top of landing5
        scale: 0.11,
        offset: 922 // gap between buttons in px
    }
};

export default function Landing() {
    // ... existing state ...
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState<{ priceId?: string; mode: 'subscription' | 'payment' }>({ mode: 'subscription' });
    const [config, setConfig] = useState({ ...INITIAL_HERO_CONFIG, ...INITIAL_BANNER_CONFIG });
    const [heroClipBottom, setHeroClipBottom] = useState(0);
    const [landing3ClipBottom, setLanding3ClipBottom] = useState(0);
    const [landing6ClipBottom, setLanding6ClipBottom] = useState(0);

    // Update Handler for Editor
    const updateConfig = (id: string, updates: Partial<HeroElementConfig>) => {
        setConfig(prev => ({
            ...prev,
            [id]: { ...prev[id], ...updates }
        }));
    };

    // ... existing refs ...
    const bannerRef = useRef<HTMLDivElement>(null); // Landing 2
    const banner4Ref = useRef<HTMLDivElement>(null); // Landing 4
    const banner6Ref = useRef<HTMLDivElement>(null); // Landing 6
    const containerRef = useRef<HTMLDivElement>(null);

    // ... existing useEffect ... (lines 19-59)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const viewportHeight = window.innerHeight;

            // --- Logic for Hero -> Landing 3 (Wiper: Landing 2) ---
            if (bannerRef.current) {
                const rect = bannerRef.current.getBoundingClientRect();
                const bannerCenter = rect.top + (rect.height / 2);
                const clipPercent = Math.max(0, Math.min(100,
                    ((viewportHeight - bannerCenter) / viewportHeight) * 100
                ));
                setHeroClipBottom(clipPercent);
            }

            // --- Logic for Landing 3 -> Landing 5/Pricing (Wiper: Landing 4) ---
            if (banner4Ref.current) {
                const rect = banner4Ref.current.getBoundingClientRect();
                const bannerCenter = rect.top + (rect.height / 2);
                const clipPercent = Math.max(0, Math.min(100,
                    ((viewportHeight - bannerCenter) / viewportHeight) * 100
                ));
                setLanding3ClipBottom(clipPercent);
            }

            // --- Logic for Landing 5/6 -> Landing 7 (Wiper: Landing 6) ---
            if (banner6Ref.current) {
                const rect = banner6Ref.current.getBoundingClientRect();
                const bannerCenter = rect.top + (rect.height / 2);
                const clipPercent = Math.max(0, Math.min(100,
                    ((viewportHeight - bannerCenter) / viewportHeight) * 100
                ));
                setLanding6ClipBottom(clipPercent);
            }
        };

        container.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
        handleScroll();

        return () => {
            container.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    return (
        <div className="landing-page" ref={containerRef}>
            {/* Global Editor - Only visible in development */}
            {import.meta.env.DEV && <HeroEditor config={config} onUpdate={updateConfig} />}

            {/* ... Sticky BG Container (unchanged lines 65-98) ... */}
            <div className="parallax-bg-container">
                {/* Layer 0 (Bottom-most): Landing 7 */}
                <div className="parallax-landing7-wrapper">
                    <img
                        src="/images/landing7.jpeg"
                        alt="Final"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>

                {/* Layer 1: Pricing BG / Landing 5 (clips to reveal landing7) */}
                <div
                    className="parallax-landing5-wrapper"
                    style={{
                        clipPath: `inset(0 0 ${landing6ClipBottom}% 0)`
                    }}
                >
                    <img
                        src="/images/landing5.jpeg"
                        alt="Pricing"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {/* Interactive Pricing Buttons */}
                    <div style={{
                        position: 'absolute',
                        top: `${config.pricing_buttons?.top ?? 75}%`,
                        left: '50%',
                        transform: `translate(-50%, -50%) scale(${config.pricing_buttons?.scale ?? 0.1})`,
                        transformOrigin: 'center center',
                        display: 'flex',
                        flexDirection: 'row',
                        gap: `${config.pricing_buttons?.offset ?? 40}px`,
                        zIndex: 10
                    }}>
                        <div
                            className="cta-hover-wrapper"
                            style={{
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
                                '--shadow-size': `${config.cta_animation?.shadowSize ?? 200}px`,
                                '--shadow-distance': `${config.cta_animation?.shadowDistance ?? 0}px`,
                                '--shadow-color-rgb': ((hex: string) => {
                                    const r = parseInt(hex.slice(1, 3), 16);
                                    const g = parseInt(hex.slice(3, 5), 16);
                                    const b = parseInt(hex.slice(5, 7), 16);
                                    return `${r}, ${g}, ${b}`;
                                })(config.cta_animation?.shadowColor ?? '#D4AF37'),
                                '--shadow-alpha': (config.cta_animation?.shadowAlpha ?? 100) / 100,
                                // Gold glow HIGH state
                                '--shadow-size-high': `${config.cta_animation?.shadowSizeHigh ?? 86}px`,
                                '--shadow-distance-high': `${config.cta_animation?.shadowDistanceHigh ?? 0}px`,
                                // Animation
                                '--anim-speed': `${config.cta_animation?.animSpeed ?? 4}s`,
                            } as React.CSSProperties}
                        >
                            <img
                                src="/images/explorer.png"
                                alt="Become Explorer"
                                onClick={() => {
                                    setSelectedTier({ priceId: 'explorer', mode: 'subscription' });
                                    setIsModalOpen(true);
                                }}
                                className="cta-image-trigger cta-heartbeat"
                                style={{
                                    '--loop-scale': config.cta_animation?.loopScale ?? 1.04,
                                    '--anim-speed': `${config.cta_animation?.animSpeed ?? 4}s`,
                                    pointerEvents: 'auto',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                } as React.CSSProperties}
                                draggable={false}
                            />
                        </div>
                        <div
                            className="cta-hover-wrapper"
                            style={{
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
                                '--shadow-size': `${config.cta_animation?.shadowSize ?? 200}px`,
                                '--shadow-distance': `${config.cta_animation?.shadowDistance ?? 0}px`,
                                '--shadow-color-rgb': ((hex: string) => {
                                    const r = parseInt(hex.slice(1, 3), 16);
                                    const g = parseInt(hex.slice(3, 5), 16);
                                    const b = parseInt(hex.slice(5, 7), 16);
                                    return `${r}, ${g}, ${b}`;
                                })(config.cta_animation?.shadowColor ?? '#D4AF37'),
                                '--shadow-alpha': (config.cta_animation?.shadowAlpha ?? 100) / 100,
                                // Gold glow HIGH state
                                '--shadow-size-high': `${config.cta_animation?.shadowSizeHigh ?? 86}px`,
                                '--shadow-distance-high': `${config.cta_animation?.shadowDistanceHigh ?? 0}px`,
                                // Animation
                                '--anim-speed': `${config.cta_animation?.animSpeed ?? 4}s`,
                            } as React.CSSProperties}
                        >
                            <img
                                src="/images/visionary.png"
                                alt="Become Visionary"
                                onClick={() => {
                                    setSelectedTier({ priceId: 'visionary', mode: 'payment' });
                                    setIsModalOpen(true);
                                }}
                                className="cta-image-trigger cta-heartbeat"
                                style={{
                                    '--loop-scale': config.cta_animation?.loopScale ?? 1.04,
                                    '--anim-speed': `${config.cta_animation?.animSpeed ?? 4}s`,
                                    pointerEvents: 'auto',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                } as React.CSSProperties}
                                draggable={false}
                            />
                        </div>
                    </div>
                </div>

                {/* Layer 2: Landing 3 (Clipped by L4) */}
                <div
                    className="parallax-landing3-wrapper"
                    style={{
                        clipPath: `inset(0 0 ${landing3ClipBottom}% 0)`,
                    }}
                >
                    <img
                        src="/images/landing3.jpg"
                        alt="Laova Vision"
                        className="landing3-img"
                    />
                </div>

                {/* Layer 3 (Top): Hero (Clipped by L2) */}
                <div
                    className="parallax-hero-wrapper"
                    style={{
                        clipPath: `inset(0 0 ${heroClipBottom}% 0)`,
                    }}
                >
                    <Hero onOpenModal={() => setIsModalOpen(true)} config={config} />
                </div>
            </div>

            {/* --- SCROLLING CONTENT --- */}
            <div className="scrolling-content-layer">

                {/* Landing 2 (Wiper 1) */}
                {/* Offset logic: 100vh = margin 0. 0vh = margin -100vh. */}
                <div
                    className="manifesto-banner-container"
                    ref={bannerRef}
                    style={{ marginTop: `${(config.landing2?.offset ?? 100) - 100}vh` }}
                >
                    <img
                        src="/images/landing2.png"
                        alt="Transformation"
                        className="manifesto-banner-img"
                    />
                </div>

                {/* Spacer 2: Controls delay before L4 */}
                <div style={{ height: `${config.landing4?.offset ?? 100}vh`, pointerEvents: 'none' }}></div>

                {/* Landing 4 (Wiper 2) */}
                <div className="manifesto-banner-container" ref={banner4Ref}>
                    <img
                        src="/images/landing4.png"
                        alt="Evolution"
                        className="manifesto-banner-img"
                    />
                </div>

                {/* Spacer 3: Controls delay before L6 */}
                <div style={{ height: `${config.landing6?.offset ?? 5}vh`, pointerEvents: 'none' }}></div>

                {/* Landing 6 (Wiper 3 - reveals Landing 7) */}
                <div className="manifesto-banner-container" ref={banner6Ref} style={{ position: 'relative' }}>
                    <img
                        src="/images/landing6.png"
                        alt="Final Vision"
                        className="manifesto-banner-img"
                    />
                    {/* Footer Integrated into Landing 6 Block - Centered */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column', // Ensure vertical stacking if multiple elements
                        alignItems: 'center',    // Horizontal Center
                        justifyContent: 'center' // Vertical Center
                    }}>
                        <Footer />
                    </div>
                </div>

                {/* Spacer AFTER L6 */}
                <div style={{
                    height: (config.landing6_bottom?.offset ?? 20) >= 0 ? `${config.landing6_bottom?.offset ?? 20}vh` : 0,
                    marginTop: (config.landing6_bottom?.offset ?? 20) < 0 ? `${config.landing6_bottom?.offset}vh` : 0
                }}></div>
            </div>

            <CheckoutModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedTier={selectedTier}
            />
        </div>
    );
}
