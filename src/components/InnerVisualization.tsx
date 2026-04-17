// Inner Visualization Component
// Displays generated imagery behind Laova representing her inner thoughts
// Bubble is draggable (mousedown+drag) and resizable (scroll wheel)
// zIndex is above canvas so interactions land on the bubble when hovering it,
// but since the container is sized exactly to the bubble, Laova's canvas is
// not blocked when the mouse is outside the bubble area.

import { useEffect, useState, useRef, useCallback } from 'react';
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

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const startPosRef = useRef({ x: 0, y: 0 });

    const displayMode = visualizationStyle?.displayMode || 'above_head';

    // Reset loaded state when image changes
    useEffect(() => {
        setImageLoaded(false);
    }, [currentVisualization]);

    // ── Drag handlers ──────────────────────────────────────────────
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (displayMode !== 'above_head') return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        startPosRef.current = { ...visualizationPosition };
    }, [displayMode, visualizationPosition]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        const xPercent = (dx / window.innerWidth) * 100;
        const yPercent = (dy / window.innerHeight) * 100;
        setVisualizationPosition({
            x: startPosRef.current.x + xPercent,
            y: startPosRef.current.y + yPercent,
        });
    }, [isDragging, setVisualizationPosition]);

    const handleMouseUp = useCallback(() => setIsDragging(false), []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // ── Scroll to resize ──────────────────────────────────────────
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (displayMode !== 'above_head') return;
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY * -0.001;
        setVisualizationScale(Math.max(0.3, Math.min(4, visualizationScale + delta)));
    }, [displayMode, visualizationScale, setVisualizationScale]);

    if (!visualizationEnabled) return null;

    // ── Bubble mode ───────────────────────────────────────────────
    if (displayMode === 'above_head') {
        const BASE = 300; // px base diameter
        const scaledSize = BASE * visualizationScale;

        const bubbleStyle: CSSProperties = {
            position: 'fixed',
            // Centre the bubble at position%
            left: `calc(${visualizationPosition.x}% - ${scaledSize / 2}px)`,
            top: `calc(${visualizationPosition.y}% - ${scaledSize / 2}px)`,
            width: `${scaledSize}px`,
            height: `${scaledSize}px`,
            // zIndex 2: above Three.js canvas, below UI overlay
            // Container is sized exactly to the bubble circle → mouse events
            // outside the bubble naturally reach the canvas/Laova instead.
            zIndex: 2,
            cursor: isDragging ? 'grabbing' : 'grab',
            pointerEvents: 'auto',
            userSelect: 'none',
            borderRadius: '50%',
            overflow: 'hidden',
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
                            objectFit: 'cover',
                            boxShadow: '0 0 40px rgba(255, 182, 193, 0.25)',
                            opacity: imageLoaded ? 1 : 0,
                            transition: 'opacity 0.5s ease',
                            display: 'block',
                        }}
                        draggable={false}
                        onLoad={() => setImageLoaded(true)}
                    />
                )}

                {/* Loading pulse */}
                {isGeneratingVisualization && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255, 182, 193, 0.4) 0%, transparent 70%)',
                        animation: 'pulse-glow 2s infinite',
                        pointerEvents: 'none',
                    }} />
                )}
            </div>
        );
    }

    // ── Fullscreen mode ───────────────────────────────────────────
    const containerStyle: CSSProperties = {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 0,
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
        pointerEvents: 'none',
    };

    return (
        <div style={containerStyle}>
            {currentVisualization && (
                <img
                    src={currentVisualization}
                    alt="Laura's inner visualization"
                    style={imageStyle}
                    draggable={false}
                    onLoad={() => setImageLoaded(true)}
                />
            )}
            {isGeneratingVisualization && (
                <div style={{
                    position: 'absolute',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 182, 193, 0.4) 0%, rgba(255, 182, 193, 0.1) 50%, transparent 70%)',
                    animation: 'pulse-glow 2s ease-in-out infinite',
                    filter: 'blur(15px)',
                }} />
            )}
            <div style={vignetteStyle} />
        </div>
    );
};

export default InnerVisualization;
