import { useState, useEffect } from 'react';

/**
 * Reference dimensions - the viewport size used when configuring
 * positioning values in HeroEditor
 */
export const REFERENCE_WIDTH = 1410;
export const REFERENCE_HEIGHT = 831;

export interface ContainerScale {
    /** Scale factor for horizontal values (width ratio) */
    x: number;
    /** Scale factor for vertical values (height ratio) */
    y: number;
    /** Uniform scale factor (min of x and y) for proportional scaling */
    uniform: number;
    /** Current container width */
    width: number;
    /** Current container height */
    height: number;
}

/**
 * Hook that provides scale factors based on current container size
 * vs reference size (1410x831px).
 * 
 * Use this to make all positioning, sizing, shadows, and animations
 * proportional to the container size.
 * 
 * Usage:
 * - scale.x for horizontal positions
 * - scale.y for vertical positions  
 * - scale.uniform for sizes, shadows, distances (maintains proportions)
 */
export function useContainerScale(): ContainerScale {
    const [scale, setScale] = useState<ContainerScale>({
        x: 1,
        y: 1,
        uniform: 1,
        width: REFERENCE_WIDTH,
        height: REFERENCE_HEIGHT
    });

    useEffect(() => {
        const updateScale = () => {
            // Get dimensions from FillerFrame's CSS custom properties
            const container = document.querySelector('.filler-frame-content');
            if (!container) {
                // Fallback to window dimensions
                const width = window.innerWidth;
                const height = window.innerHeight;
                setScale({
                    x: width / REFERENCE_WIDTH,
                    y: height / REFERENCE_HEIGHT,
                    uniform: Math.min(width / REFERENCE_WIDTH, height / REFERENCE_HEIGHT),
                    width,
                    height
                });
                return;
            }

            const width = container.clientWidth;
            const height = container.clientHeight;

            setScale({
                x: width / REFERENCE_WIDTH,
                y: height / REFERENCE_HEIGHT,
                uniform: Math.min(width / REFERENCE_WIDTH, height / REFERENCE_HEIGHT),
                width,
                height
            });
        };

        // Initial calculation
        updateScale();

        // Update on resize
        window.addEventListener('resize', updateScale);

        // Also update when orientation changes
        const mediaQuery = window.matchMedia('(orientation: portrait)');
        mediaQuery.addEventListener('change', updateScale);

        return () => {
            window.removeEventListener('resize', updateScale);
            mediaQuery.removeEventListener('change', updateScale);
        };
    }, []);

    return scale;
}

/**
 * Helper to scale a pixel value proportionally
 */
export function scaleValue(value: number, scaleFactor: number): number {
    return value * scaleFactor;
}

/**
 * Helper to scale a pixel value and return as string with 'px' suffix
 */
export function scalePx(value: number, scaleFactor: number): string {
    return `${value * scaleFactor}px`;
}
