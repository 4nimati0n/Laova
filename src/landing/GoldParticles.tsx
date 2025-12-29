import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    size: number;
    speedY: number;
    opacity: number;
    hue: number; // For color gradient
}

export default function GoldParticles() {
    // DISABLED: Return null to disable particles effect without removing code
    return null;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Initialize particles
        const particleCount = 25;
        const particles: Particle[] = [];

        for (let i = 0; i < particleCount; i++) {
            particles.push(createParticle(canvas.height));
        }
        particlesRef.current = particles;

        function createParticle(canvasHeight: number): Particle {
            const y = Math.random() * canvasHeight;
            // Color gradient: bottom (orange) to top (cream)
            // Bottom: hue ~30 (orange), Top: hue ~45 (gold/cream)
            const normalizedY = y / canvasHeight;
            const hue = 30 + (normalizedY * 15); // 30 at bottom, 45 at top

            return {
                x: Math.random() * window.innerWidth,
                y,
                size: 2 + Math.random() * 6, // 2-8px
                speedY: 0.2 + Math.random() * 0.5, // Slow upward movement
                opacity: 0.3 + Math.random() * 0.7,
                hue,
            };
        }

        function animate() {
            if (!ctx || !canvas) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current.forEach((particle, index) => {
                // Move particle up
                particle.y -= particle.speedY;

                // Update color based on Y position
                const normalizedY = particle.y / canvas.height;
                particle.hue = 30 + ((1 - normalizedY) * 15);

                // Reset if off screen
                if (particle.y < -10) {
                    particlesRef.current[index] = createParticle(canvas.height);
                    particlesRef.current[index].y = canvas.height + 10;
                }

                // Draw particle with glow
                const saturation = 80 - (normalizedY * 30); // More saturated at bottom
                const lightness = 50 + (normalizedY * 30); // Lighter at top

                // Outer glow
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${particle.hue}, ${saturation}%, ${lightness}%, ${particle.opacity * 0.3})`;
                ctx.fill();

                // Inner core
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${particle.hue}, ${saturation}%, ${lightness + 20}%, ${particle.opacity})`;
                ctx.fill();
            });

            animationRef.current = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 50,
                mixBlendMode: 'screen', // Bright additive blending
            }}
        />
    );
}
