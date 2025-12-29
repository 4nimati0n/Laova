import { useState, useEffect, type ReactNode } from 'react';
import { useOrientation, ASPECT_RATIO_LANDSCAPE, ASPECT_RATIO_PORTRAIT } from '../hooks/useOrientation';

interface ResponsiveFillerProps {
    children: ReactNode;
    fillerSrc?: string;
    /** Override content aspect ratio. If not provided, auto-detects based on orientation */
    contentAspectRatio?: number;
}

/**
 * ResponsiveFiller Component
 * 
 * Dynamically places filler images around content based on viewport aspect ratio.
 * - If viewport is TALLER than content aspect ratio: filler at TOP and BOTTOM
 * - If viewport is WIDER than content aspect ratio: filler at LEFT and RIGHT
 * 
 * Automatically detects orientation and uses appropriate aspect ratio:
 * - Landscape: 16:9 (for desktop images)
 * - Portrait: 9:16 (for mobile images)
 */
export default function ResponsiveFiller({
    children,
    fillerSrc = '/images/background_filler.png',
    contentAspectRatio: overrideAspectRatio
}: ResponsiveFillerProps) {
    const orientation = useOrientation();
    const [fillMode, setFillMode] = useState<'vertical' | 'horizontal' | 'none'>('none');
    const [fillerSize, setFillerSize] = useState(0);

    // Auto-detect aspect ratio based on orientation, or use override
    const contentAspectRatio = overrideAspectRatio ??
        (orientation === 'portrait' ? ASPECT_RATIO_PORTRAIT : ASPECT_RATIO_LANDSCAPE);

    useEffect(() => {
        const calculateFillMode = () => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const viewportAspectRatio = viewportWidth / viewportHeight;

            if (viewportAspectRatio < contentAspectRatio) {
                // Viewport is TALLER than content -> need top/bottom filler
                const contentHeight = viewportWidth / contentAspectRatio;
                const emptySpace = viewportHeight - contentHeight;
                setFillerSize(Math.max(0, emptySpace / 2));
                setFillMode('vertical');
            } else if (viewportAspectRatio > contentAspectRatio) {
                // Viewport is WIDER than content -> need left/right filler
                const contentWidth = viewportHeight * contentAspectRatio;
                const emptySpace = viewportWidth - contentWidth;
                setFillerSize(Math.max(0, emptySpace / 2));
                setFillMode('horizontal');
            } else {
                setFillMode('none');
                setFillerSize(0);
            }
        };

        calculateFillMode();
        window.addEventListener('resize', calculateFillMode);
        return () => window.removeEventListener('resize', calculateFillMode);
    }, [contentAspectRatio]);

    // Don't render fillers if not needed
    if (fillMode === 'none' || fillerSize <= 0) {
        return <>{children}</>;
    }

    return (
        <div className="responsive-filler-container" style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: '#0b0a09'
        }}>
            {/* Vertical fillers (top/bottom) */}
            {fillMode === 'vertical' && (
                <>
                    {/* Top filler - shows BOTTOM of the filler image */}
                    <div
                        className="filler-top"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${fillerSize}px`,
                            overflow: 'hidden',
                            zIndex: 5
                        }}
                    >
                        <img
                            src={fillerSrc}
                            alt=""
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '100%',
                                height: 'auto',
                                minHeight: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center bottom'
                            }}
                        />
                    </div>

                    {/* Bottom filler - shows TOP of the filler image */}
                    <div
                        className="filler-bottom"
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            height: `${fillerSize}px`,
                            overflow: 'hidden',
                            zIndex: 5
                        }}
                    >
                        <img
                            src={fillerSrc}
                            alt=""
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '100%',
                                height: 'auto',
                                minHeight: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center top'
                            }}
                        />
                    </div>
                </>
            )}

            {/* Horizontal fillers (left/right) */}
            {fillMode === 'horizontal' && (
                <>
                    {/* Left filler - shows RIGHT edge of filler image */}
                    <div
                        className="filler-left"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: `${fillerSize}px`,
                            height: '100%',
                            overflow: 'hidden',
                            zIndex: 5
                        }}
                    >
                        <img
                            src={fillerSrc}
                            alt=""
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                height: '100%',
                                width: 'auto',
                                minWidth: '100%',
                                objectFit: 'cover',
                                objectPosition: 'right center'
                            }}
                        />
                    </div>

                    {/* Right filler - shows LEFT edge of filler image */}
                    <div
                        className="filler-right"
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: `${fillerSize}px`,
                            height: '100%',
                            overflow: 'hidden',
                            zIndex: 5
                        }}
                    >
                        <img
                            src={fillerSrc}
                            alt=""
                            style={{
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                height: '100%',
                                width: 'auto',
                                minWidth: '100%',
                                objectFit: 'cover',
                                objectPosition: 'left center'
                            }}
                        />
                    </div>
                </>
            )}

            {/* Main content - centered */}
            <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                zIndex: 10
            }}>
                {children}
            </div>
        </div>
    );
}
