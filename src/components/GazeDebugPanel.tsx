import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

// Debug panel for head rotation calibration
// Shows body and head rotations, allows manual head adjustment via sliders
export const GazeDebugPanel = () => {
    const { gazeDebugEnabled, headRotationOverride, setHeadRotationOverride } = useAppStore();

    const [bodyRotation, setBodyRotation] = useState({ x: 0, y: 0, z: 0 });
    const [headRotation, setHeadRotation] = useState({ x: 0, y: 0, z: 0 });
    const [lauraPosition, setLauraPosition] = useState({ x: 0, y: 0, z: 0 });
    const [zoomLevel, setZoomLevel] = useState(1);

    // Listen for debug data updates from Avatar component
    useEffect(() => {
        const updateDebugData = () => {
            const data = (window as any).__gazeDebugData;
            if (data) {
                setBodyRotation(data.bodyRotation || { x: 0, y: 0, z: 0 });
                setHeadRotation(data.headRotation || { x: 0, y: 0, z: 0 });
                setLauraPosition(data.lauraPosition || { x: 0, y: 0, z: 0 });
            }
            // Get zoom level from Scene component
            const zoom = (window as any).__lauraZoom;
            if (zoom !== undefined) {
                setZoomLevel(zoom);
            }
        };

        const interval = setInterval(updateDebugData, 100);
        return () => clearInterval(interval);
    }, []);

    if (!gazeDebugEnabled) return null;

    const toDeg = (rad: number) => (rad * 180 / Math.PI).toFixed(1);

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.85)',
            color: '#0f0',
            padding: '15px',
            borderRadius: '10px',
            fontFamily: 'monospace',
            fontSize: '12px',
            zIndex: 9999,
            minWidth: '320px',
            border: '1px solid #0f0'
        }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0ff' }}>🎯 Gaze Debug Panel</h3>

            {/* Laura's World Position */}
            <div style={{ marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                <strong style={{ color: '#ff0' }}>🧍 Laura Position:</strong>
                <div>X: {lauraPosition.x.toFixed(2)} | Y: {lauraPosition.y.toFixed(2)} | Z: {lauraPosition.z.toFixed(2)}</div>
            </div>

            {/* Zoom Level */}
            <div style={{ marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                <strong style={{ color: '#0ff' }}>🔍 Zoom:</strong>
                <span style={{ marginLeft: '10px' }}>{(zoomLevel * 100).toFixed(0)}%</span>
            </div>
            {/* Body Rotation */}
            <div style={{ marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                <strong style={{ color: '#f0f' }}>🧍 Body Rotation (deg):</strong>
                <div>
                    X: {toDeg(bodyRotation.x)}° | Y: {toDeg(bodyRotation.y)}° | Z: {toDeg(bodyRotation.z)}°
                </div>
            </div>

            {/* Current Head Rotation */}
            <div style={{ marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                <strong style={{ color: '#0ff' }}>👤 Head Rotation (current):</strong>
                <div>
                    X: {toDeg(headRotation.x)}° | Y: {toDeg(headRotation.y)}° | Z: {toDeg(headRotation.z)}°
                </div>
            </div>

            {/* Manual Head Override Sliders */}
            <div style={{ marginTop: '15px' }}>
                <strong style={{ color: '#ff0' }}>🎚️ Manual Head Override:</strong>

                <div style={{ marginTop: '8px' }}>
                    <label>X (Pitch): {toDeg(headRotationOverride?.x || 0)}°</label>
                    <input
                        type="range"
                        min="-90"
                        max="90"
                        value={(headRotationOverride?.x || 0) * 180 / Math.PI}
                        onChange={(e) => setHeadRotationOverride({
                            x: parseFloat(e.target.value) * Math.PI / 180,
                            y: headRotationOverride?.y || 0,
                            z: headRotationOverride?.z || 0
                        })}
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ marginTop: '8px' }}>
                    <label>Y (Yaw): {toDeg(headRotationOverride?.y || 0)}°</label>
                    <input
                        type="range"
                        min="-90"
                        max="90"
                        value={(headRotationOverride?.y || 0) * 180 / Math.PI}
                        onChange={(e) => setHeadRotationOverride({
                            x: headRotationOverride?.x || 0,
                            y: parseFloat(e.target.value) * Math.PI / 180,
                            z: headRotationOverride?.z || 0
                        })}
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ marginTop: '8px' }}>
                    <label>Z (Roll): {toDeg(headRotationOverride?.z || 0)}°</label>
                    <input
                        type="range"
                        min="-45"
                        max="45"
                        value={(headRotationOverride?.z || 0) * 180 / Math.PI}
                        onChange={(e) => setHeadRotationOverride({
                            x: headRotationOverride?.x || 0,
                            y: headRotationOverride?.y || 0,
                            z: parseFloat(e.target.value) * Math.PI / 180
                        })}
                        style={{ width: '100%' }}
                    />
                </div>

                <button
                    onClick={() => setHeadRotationOverride({ x: 0, y: 0, z: 0 })}
                    style={{
                        marginTop: '10px',
                        padding: '5px 10px',
                        background: '#333',
                        color: '#fff',
                        border: '1px solid #666',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Reset to 0
                </button>
            </div>

            {/* Instructions */}
            <div style={{ marginTop: '15px', fontSize: '10px', color: '#888' }}>
                Rotate Laura's body, then use sliders to make her look at camera center.
                Take screenshots at different positions for calibration.
            </div>
        </div>
    );
};
