import { useState, useEffect } from 'react';

export type Orientation = 'landscape' | 'portrait';

/**
 * Custom hook to detect viewport orientation.
 * - 'landscape': viewport is wider than tall (or equal)
 * - 'portrait': viewport is taller than wide
 */
export function useOrientation(): Orientation {
    const [orientation, setOrientation] = useState<Orientation>(() => {
        if (typeof window === 'undefined') return 'landscape';
        return window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait';
    });

    useEffect(() => {
        const handleResize = () => {
            setOrientation(window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait');
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return orientation;
}

/**
 * Helper to get the correct image source based on orientation.
 * @param basePath - The base image path without extension (e.g., '/images/landing1')
 * @param extension - The file extension (e.g., 'jpeg', 'png')
 * @param orientation - Current viewport orientation
 * @returns The appropriate image path
 */
export function getResponsiveImageSrc(
    basePath: string,
    extension: string,
    orientation: Orientation
): string {
    if (orientation === 'portrait') {
        return `${basePath}-mobile.${extension}`;
    }
    return `${basePath}.${extension}`;
}

// Image aspect ratios
export const ASPECT_RATIO_LANDSCAPE = 16 / 9; // ~1.777
export const ASPECT_RATIO_PORTRAIT = 9 / 16;  // ~0.5625
