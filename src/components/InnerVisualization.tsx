// Inner Visualization Component
// Displays generated imagery behind Laura's head representing her inner thoughts
// Supports drag to reposition and scroll to resize in above_head mode

import { useEffect, useState, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useAppStore } from '../store/useAppStore';
import '../styles/InnerVisualization.css';

export const InnerVisualization = () => {
    const {
        visualizationEnabled,
        currentVisualization,
        isGeneratingVisualization,
        visualizationStyle,
        visualizationPosition,
        visualizationScale,
        setVisualizationPosition,
        setVisualizationScale
    } = useAppStore();

    const [imageLoaded, setImageLoaded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Drag State
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const startPosRef = useRef({ x: 0, y: 0 });

    const displayMode = visualizationStyle?.displayMode || 'above_head';

    // Reset loaded state when image changes
    useEffect(() => {
        setImageLoaded(false);
    }, [currentVisualization]);

    // Handle Drag
    const handleMouseDown = (e: React.MouseEvent) => {
        if (displayMode !== 'above_head') return;
        e.preventDefault();
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        startPosRef.current = { ...visualizationPosition };
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;

        // Convert pixels to percentage
        const xPercent = (dx / window.innerWidth) * 100;
        const yPercent = (dy / window.innerHeight) * 100;

        setVisualizationPosition({
            x: startPosRef.current.x + xPercent,
            y: startPosRef.current.y + yPercent
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    // Handle Resize
    const handleWheel = (e: React.WheelEvent) => {
        if (displayMode !== 'above_head') return;
        e.stopPropagation();
        const delta = e.deltaY * -0.001;
        setVisualizationScale(Math.max(0.5, Math.min(3, visualizationScale + delta)));
    };

    if (!visualizationEnabled) return null;

    // Bubble Mode Render
    if (displayMode === 'above_head') {
        const bubbleStyle: CSSProperties = {
            position: 'fixed',
            left: `${visualizationPosition.x}%`,
            top: `${visualizationPosition.y}%`,
            transform: `translate(-50%, -50%) scale(${visualizationScale})`,
            zIndex: 0, // Behind Text (1) and Laura (2)
            cursor: isDragging ? 'grabbing' : 'grab',
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '300px', // Base size
            height: '300px',
        };

        return (
            <div
                style={bubbleStyle}
                onMouseDown={handleMouseDown}
                onWheel={handleWheel}
            >
                {/* Image */}
                {currentVisualization && (
                    <img
                        src={currentVisualization}
                        alt="Laura's inner visualization"
                        style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            boxShadow: '0 0 20px rgba(255, 182, 193, 0.3)',
                            opacity: imageLoaded ? 1 : 0,
                            transition: 'opacity 0.5s ease'
                        }}
                        draggable={false}
                        onLoad={() => setImageLoaded(true)}
                    />
                )}

                {/* Loading Pulse */}
                {isGeneratingVisualization && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255, 182, 193, 0.4) 0%, transparent 70%)',
                        animation: 'pulse-glow 2s infinite'
                    }} />
                )}
            </div>
        );
    }

    // Fullscreen styles
    const containerStyle: CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0, // Behind Scene
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        pointerEvents: 'none',
    };

    const imageStyle: CSSProperties = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: imageLoaded ? 1 : 0,
        transition: 'opacity 1.2s ease-in-out',
        filter: 'saturate(1.1)',
    };

    const vignetteStyle: CSSProperties = {
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0, 0, 0, 0.4) 70%, rgba(0, 0, 0, 0.8) 100%)',
        pointerEvents: 'none'
    };

    return (
        <div ref={containerRef} style={containerStyle}>
            {currentVisualization && (
                <img
                    src={currentVisualization}
                    alt="Laura's inner visualization"
                    style={imageStyle}
                    draggable={false}
                    onLoad={() => {
                        console.log('🖼️ Visualization loaded!');
                        setImageLoaded(true);
                    }}
                />
            )}

            {/* Loading indicator for fullscreen */}
            {isGeneratingVisualization && (
                <div style={{
                    position: 'absolute',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 182, 193, 0.4) 0%, rgba(255, 182, 193, 0.1) 50%, transparent 70%)',
                    animation: 'pulse-glow 2s ease-in-out infinite',
                    filter: 'blur(15px)'
                }} />
            )}

            <div style={vignetteStyle} />
        </div>
    );
};

export default InnerVisualization;
