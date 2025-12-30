import { useState } from 'react';
import { createPortal } from 'react-dom';

export interface HeroElementConfig {
    id: string;
    name: string;
    top?: number; // percentage
    scale?: number;
    depth?: number; // parallax factor
    zIndex?: number;
    offset?: number; // vh/px value for banners/gaps
    // Optional advanced controls
    width?: number; // percentage
    height?: number; // percentage
    gradientStart?: number; // %
    gradientMid?: number; // %
    gradientEnd?: number; // %
    // Animation controls
    loopScale?: number;      // Scale for heartbeat pulse (e.g. 1.04)
    animSpeed?: number;      // Animation duration in seconds
    // Default shadow (dark) - LOW state (scale 1)
    defaultShadowSize?: number;
    defaultShadowDistance?: number;
    defaultShadowColor?: string;    // Hex color
    defaultShadowAlpha?: number;    // 0-100
    // Default shadow HIGH state (at peak scale)
    defaultShadowSizeHigh?: number;
    defaultShadowDistanceHigh?: number;
    // Gold glow - LOW state (scale 1)
    shadowSize?: number;           // Gold glow blur in px
    shadowDistance?: number;       // Gold glow Y offset in px
    shadowColor?: string;          // Gold glow color (hex)
    shadowAlpha?: number;          // 0-100
    // Gold glow HIGH state (at peak scale)
    shadowSizeHigh?: number;
    shadowDistanceHigh?: number;
    // CTA Scroll config
    scrollDuration?: number;        // Scroll animation duration in ms
    scrollTarget?: number;          // Target scroll position in vh
    // Filler scale
    fillerScale?: number;           // Scale multiplier for filler images (e.g., 1.05 = 5% larger)
}

interface HeroEditorProps {
    config: Record<string, HeroElementConfig>;
    onUpdate: (id: string, updates: Partial<HeroElementConfig>) => void;
}

export default function HeroEditor({ config, onUpdate }: HeroEditorProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [mounted, setMounted] = useState(false);

    useState(() => {
        setMounted(true);
    });

    if (!mounted) return null;

    const editorContent = (
        <>
            {!isVisible && (
                <button
                    onClick={() => setIsVisible(true)}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 2147483647, /* Max z-index */
                        background: '#D4AF37',
                        border: '2px solid #fff',
                        borderRadius: '4px',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        color: '#000',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        fontFamily: 'sans-serif'
                    }}
                >
                    Edit Hero
                </button>
            )}

            {isVisible && minimized && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 2147483647,
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    padding: '10px',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: 'sans-serif'
                }}>
                    <button onClick={() => setMinimized(false)} style={{ marginRight: '10px', cursor: 'pointer' }}>Expand</button>
                    <button onClick={() => setIsVisible(false)} style={{ cursor: 'pointer' }}>Close</button>
                </div>
            )}

            {isVisible && !minimized && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    width: '320px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    zIndex: 2147483647,
                    background: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid #D4AF37',
                    padding: '20px',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: 'monospace',
                    boxShadow: '-10px 0 30px rgba(0,0,0,0.8)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, color: '#D4AF37' }}>Hero Editor</h3>
                        <div>
                            <button onClick={() => setMinimized(true)} style={{ marginRight: '8px', cursor: 'pointer', padding: '2px 8px' }}>_</button>
                            <button onClick={() => setIsVisible(false)} style={{ cursor: 'pointer', padding: '2px 8px' }}>X</button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <button onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(config, null, 2));
                            alert('Copied to clipboard!');
                        }} style={{
                            width: '100%',
                            padding: '10px',
                            background: '#D4AF37',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}>
                            Copy Config JSON
                        </button>
                    </div>

                    {Object.values(config).map((element) => (
                        <div key={element.id} style={{
                            marginBottom: '20px',
                            borderBottom: '1px solid #333',
                            paddingBottom: '16px'
                        }}>
                            <strong style={{ color: '#aaa', display: 'block', marginBottom: '8px', textTransform: 'uppercase', fontSize: '11px' }}>
                                {element.name}
                            </strong>

                            {[
                                { label: 'Top %', key: 'top', min: -50, max: 150, step: 0.5, conditional: true },
                                { label: 'Gap px', key: 'offset', min: -300, max: 1800, step: 1, conditional: true },
                                { label: 'Scale', key: 'scale', min: 0.01, max: 0.2, step: 0.005, conditional: true },
                                // Animation controls
                                { label: 'Loop ⇅', key: 'loopScale', min: 1.0, max: 1.2, step: 0.005, conditional: true },
                                { label: 'Speed s', key: 'animSpeed', min: 0.5, max: 10, step: 0.5, conditional: true },
                                // Default shadow (dark) LOW state
                                { label: 'D.Sz Lo', key: 'defaultShadowSize', min: 0, max: 100, step: 1, conditional: true },
                                { label: 'D.Dst Lo', key: 'defaultShadowDistance', min: 0, max: 50, step: 1, conditional: true },
                                { label: 'D.α', key: 'defaultShadowAlpha', min: 0, max: 100, step: 1, conditional: true },
                                // Default shadow HIGH state
                                { label: 'D.Sz Hi', key: 'defaultShadowSizeHigh', min: 0, max: 150, step: 1, conditional: true },
                                { label: 'D.Dst Hi', key: 'defaultShadowDistanceHigh', min: 0, max: 80, step: 1, conditional: true },
                                // Gold glow LOW state
                                { label: 'G.Sz Lo', key: 'shadowSize', min: 0, max: 200, step: 1, conditional: true },
                                { label: 'G.Dst Lo', key: 'shadowDistance', min: 0, max: 50, step: 1, conditional: true },
                                { label: 'G.α', key: 'shadowAlpha', min: 0, max: 100, step: 1, conditional: true },
                                // Gold glow HIGH state
                                { label: 'G.Sz Hi', key: 'shadowSizeHigh', min: 0, max: 300, step: 1, conditional: true },
                                { label: 'G.Dst Hi', key: 'shadowDistanceHigh', min: 0, max: 80, step: 1, conditional: true },
                                // Scroll controls
                                { label: 'Sc.Dur', key: 'scrollDuration', min: 500, max: 5000, step: 100, conditional: true },
                                { label: 'Sc.Tgt', key: 'scrollTarget', min: 300, max: 400, step: 1, conditional: true },
                                // Filler scale
                                { label: 'Fill.Scl', key: 'fillerScale', min: 1.0, max: 1.5, step: 0.001, conditional: true },
                                // Conditional fields
                                { label: 'Width %', key: 'width', min: 10, max: 200, step: 1, conditional: true },
                                { label: 'Height %', key: 'height', min: 10, max: 200, step: 1, conditional: true },
                                { label: 'G-Start', key: 'gradientStart', min: 0, max: 100, step: 1, conditional: true },
                                { label: 'G-Mid', key: 'gradientMid', min: 0, max: 100, step: 1, conditional: true },
                                { label: 'G-End', key: 'gradientEnd', min: 0, max: 100, step: 1, conditional: true },
                            ].map(field => {
                                if (field.conditional && (element as any)[field.key] === undefined) return null;
                                return (
                                    <div key={field.key} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 40px', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                        <label style={{ fontSize: '10px', color: '#888' }}>{field.label}</label>
                                        <input
                                            type="range"
                                            min={field.min}
                                            max={field.max}
                                            step={field.step}
                                            value={(element as any)[field.key]}
                                            onChange={(e) => onUpdate(element.id, { [field.key]: parseFloat(e.target.value) })}
                                            style={{ accentColor: '#D4AF37' }}
                                        />
                                        <span style={{ fontSize: '10px', textAlign: 'right' }}>{(element as any)[field.key]}</span>
                                    </div>
                                );
                            })}

                            {/* Color pickers for shadows */}
                            {element.shadowColor !== undefined && (
                                <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 40px', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                    <label style={{ fontSize: '10px', color: '#888' }}>H.Glow</label>
                                    <input
                                        type="color"
                                        value={element.shadowColor}
                                        onChange={(e) => onUpdate(element.id, { shadowColor: e.target.value })}
                                        style={{ width: '100%', height: '24px', border: 'none', cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '8px', textAlign: 'right' }}>{element.shadowColor}</span>
                                </div>
                            )}
                            {element.defaultShadowColor !== undefined && (
                                <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 40px', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                    <label style={{ fontSize: '10px', color: '#888' }}>D.Shd</label>
                                    <input
                                        type="color"
                                        value={element.defaultShadowColor}
                                        onChange={(e) => onUpdate(element.id, { defaultShadowColor: e.target.value })}
                                        style={{ width: '100%', height: '24px', border: 'none', cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '8px', textAlign: 'right' }}>{element.defaultShadowColor}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    return createPortal(editorContent, document.body);
}
