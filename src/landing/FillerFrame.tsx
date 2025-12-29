import { useState, useEffect, type ReactNode } from 'react';
import { useOrientation, ASPECT_RATIO_LANDSCAPE, ASPECT_RATIO_PORTRAIT } from '../hooks/useOrientation';

interface FillerFrameProps {
    children: ReactNode;
    fillerSrc?: string;
}

/**
 * FillerFrame Component
 * 
 * Creates a fixed frame around the viewport with filler images on the edges.
 * The central content area is scrollable with overlay-style scrollbars.
 * 
 * Layout:
 * - Fixed fillers on edges (top/bottom or left/right based on orientation)
 * - Central scrollable container for all landing content
 * - Scrollbar overlays content (mobile-style)
 */
export default function FillerFrame({
    children,
    fillerSrc = '/images/background_filler.png'
}: FillerFrameProps) {
    const orientation = useOrientation();
    const [fillMode, setFillMode] = useState<'vertical' | 'horizontal' | 'none'>('none');
    const [fillerSize, setFillerSize] = useState(0);

    // Determine content aspect ratio based on orientation
    const contentAspectRatio = orientation === 'portrait'
        ? ASPECT_RATIO_PORTRAIT
        : ASPECT_RATIO_LANDSCAPE;

    useEffect(() => {
        const calculateLayout = () => {
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

        calculateLayout();
        window.addEventListener('resize', calculateLayout);
        return () => window.removeEventListener('resize', calculateLayout);
    }, [contentAspectRatio]);

    // Calculate content dimensions for CSS custom properties
    const getContentDimensions = () => {
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

        if (fillMode === 'vertical') {
            return {
                width: viewportWidth,
                height: viewportHeight - (fillerSize * 2)
            };
        } else if (fillMode === 'horizontal') {
            return {
                width: viewportWidth - (fillerSize * 2),
                height: viewportHeight
            };
        }
        return {
            width: viewportWidth,
            height: viewportHeight
        };
    };

    const contentDimensions = getContentDimensions();

    // Calculate content area dimensions
    const getContentStyle = (): React.CSSProperties => {
        const baseStyle: React.CSSProperties = {
            // CSS custom properties for child elements to use instead of 100vh/100vw
            '--content-height': `${contentDimensions.height}px`,
            '--content-width': `${contentDimensions.width}px`,
        } as React.CSSProperties;

        if (fillMode === 'vertical') {
            return {
                ...baseStyle,
                position: 'absolute',
                top: `${fillerSize}px`,
                left: 0,
                width: '100%',
                height: `${contentDimensions.height}px`,
                overflowX: 'hidden',
                overflowY: 'auto',
                zIndex: 10
            };
        } else if (fillMode === 'horizontal') {
            return {
                ...baseStyle,
                position: 'absolute',
                top: 0,
                left: `${fillerSize}px`,
                width: `${contentDimensions.width}px`,
                height: '100%',
                overflowX: 'hidden',
                overflowY: 'auto',
                zIndex: 10
            };
        }
        return {
            ...baseStyle,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflowX: 'hidden',
            overflowY: 'auto',
            zIndex: 10
        };
    };

    return (
        <div className="filler-frame" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            backgroundColor: '#0b0a09'
        }}>
            {/* Vertical fillers (top/bottom) */}
            {fillMode === 'vertical' && (
                <>
                    {/* Top filler - shows BOTTOM of the filler image */}
                    <div
                        className="filler-edge filler-top"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${fillerSize}px`,
                            overflow: 'hidden',
                            zIndex: 20
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
                        className="filler-edge filler-bottom"
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            height: `${fillerSize}px`,
                            overflow: 'hidden',
                            zIndex: 20
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
                        className="filler-edge filler-left"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: `${fillerSize}px`,
                            height: '100%',
                            overflow: 'hidden',
                            zIndex: 20
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
                        className="filler-edge filler-right"
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: `${fillerSize}px`,
                            height: '100%',
                            overflow: 'hidden',
                            zIndex: 20
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

            {/* Central content area with hidden scrollbar overlay technique */}
            {/* Outer wrapper clips the scrollbar, inner wrapper scrolls */}
            <div
                className="filler-frame-outer"
                style={{
                    ...getContentStyle(),
                    overflow: 'hidden', // Hide the scrollbar that extends beyond
                }}
            >
                <div
                    className="filler-frame-content"
                    style={{
                        width: 'calc(100% + 20px)', // Extend width to push scrollbar out
                        height: '100%',
                        overflowX: 'hidden',
                        overflowY: 'scroll',
                        paddingRight: '20px', // Compensate for the extended width
                        boxSizing: 'content-box',
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
