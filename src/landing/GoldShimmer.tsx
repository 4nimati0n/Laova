import { useEffect, useRef } from 'react';

export default function GoldShimmer() {
    // DISABLED: Return null to disable shimmer effect without removing code
    return null;

    const shimmerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Animate the shimmer position
        let position = -100;
        const speed = 0.15; // Slow movement

        const animate = () => {
            position += speed;
            if (position > 200) {
                position = -100;
            }

            if (shimmerRef.current) {
                shimmerRef.current.style.setProperty('--shimmer-pos', `${position}%`);
            }

            requestAnimationFrame(animate);
        };

        const animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, []);

    return (
        <div
            ref={shimmerRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 45,
                // Gradient that moves across - emphasizes gold tones
                background: `linear-gradient(
                    105deg,
                    transparent 0%,
                    transparent calc(var(--shimmer-pos, 0%) - 10%),
                    rgba(212, 175, 55, 0.15) calc(var(--shimmer-pos, 0%)),
                    rgba(243, 229, 171, 0.25) calc(var(--shimmer-pos, 0%) + 5%),
                    rgba(212, 175, 55, 0.15) calc(var(--shimmer-pos, 0%) + 10%),
                    transparent calc(var(--shimmer-pos, 0%) + 20%),
                    transparent 100%
                )`,
                mixBlendMode: 'color-dodge', // Amplifies gold colors
            }}
        />
    );
}
