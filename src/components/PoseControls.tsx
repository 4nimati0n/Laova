import { useAppStore } from '../store/useAppStore';
import { useState } from 'react';

export const PoseControls = () => {
    const { poseControls, setPoseRotation, triggerEmotion, setEmotionIntensity,
        lipSyncSensitivity,
        lipSyncSmoothing,
        lipSyncNoiseFloor,
        lipSyncSibilantThreshold,
        lipSyncClosedThreshold,
        setLipSyncSettings,
        showPoseControls,
        breathingRate,
        breathingEnabled,
        setBreathingRate,
        setBreathingEnabled
    } = useAppStore();

    const [showArmControls, setShowArmControls] = useState(false);
    const [emotionIntensities, setEmotionIntensities] = useState({
        neutral: 1.0,
        happy: 1.0,
        angry: 2.0,
        sad: 2.0,
        relaxed: 2.0,
        surprised: 2.5,
        extra: 1.0,
        blink: 1.0,
        fun: 1.5,
        joy: 1.5,
        sorrow: 2.0,
    });

    const emotions = [
        { name: 'neutral', label: 'Neutre', color: '#888' },
        { name: 'happy', label: 'Joyeux', color: '#ffd700' },
        { name: 'angry', label: 'En colère', color: '#ff4444' },
        { name: 'sad', label: 'Triste', color: '#4488ff' },
        { name: 'relaxed', label: 'Détendu', color: '#88ff88' },
        { name: 'surprised', label: 'Surpris', color: '#ff88ff' },
        { name: 'fun', label: 'Fun', color: '#ffaa00' },
        { name: 'joy', label: 'Joie', color: '#ffdd00' },
        { name: 'sorrow', label: 'Chagrin', color: '#6677ff' },
        { name: 'extra', label: 'Extra', color: '#ff00ff' },
        { name: 'blink', label: 'Blink', color: '#00ffff' },
    ];

    if (!showPoseControls) return null;

    const handleEmotionClick = (emotionName: string) => {
        const intensity = emotionIntensities[emotionName as keyof typeof emotionIntensities];
        setEmotionIntensity(intensity);
        triggerEmotion(emotionName);
        // Reset after 2 seconds
        setTimeout(() => triggerEmotion('neutral'), 2000);
    };

    const handleEmotionIntensityChange = (emotionName: string, value: number) => {
        setEmotionIntensities(prev => ({
            ...prev,
            [emotionName]: value
        }));
    };

    const SliderGroup = ({
        label,
        part,
        axis,
        value,
        min = -Math.PI,
        max = Math.PI,
    }: {
        label: string;
        part: keyof typeof poseControls;
        axis: 'x' | 'y' | 'z';
        value: number;
        min?: number;
        max?: number;
    }) => (
        <div className="slider-row">
            <label>
                {label} ({value.toFixed(2)})
            </label>
            <input
                type="range"
                min={min}
                max={max}
                step={0.01}
                value={value}
                onChange={(e) => setPoseRotation(part, axis, parseFloat(e.target.value))}
            />
        </div>
    );

    return (
        <div className="pose-controls-panel">
            <div className="pose-controls-header" onClick={() => setShowArmControls(!showArmControls)} style={{ cursor: 'pointer' }}>
                <h2>Contrôle des Bras {showArmControls ? '▼' : '▶'}</h2>
            </div>

            {showArmControls && (
                <div className="pose-controls-content">
                    <div className="pose-group">
                        <h3>Épaule</h3>
                        <SliderGroup label="Rotation X" part="shoulder" axis="x" value={poseControls.shoulder.x} />
                        <SliderGroup label="Rotation Y" part="shoulder" axis="y" value={poseControls.shoulder.y} />
                        <SliderGroup label="Rotation Z" part="shoulder" axis="z" value={poseControls.shoulder.z} />
                    </div>

                    <div className="pose-group">
                        <h3>Bras</h3>
                        <SliderGroup label="Rotation X" part="upperArm" axis="x" value={poseControls.upperArm.x} />
                        <SliderGroup label="Rotation Y" part="upperArm" axis="y" value={poseControls.upperArm.y} />
                        <SliderGroup label="Rotation Z" part="upperArm" axis="z" value={poseControls.upperArm.z} />
                    </div>

                    <div className="pose-group">
                        <h3>Avant-bras</h3>
                        <SliderGroup label="Rotation X" part="lowerArm" axis="x" value={poseControls.lowerArm.x} />
                        <SliderGroup label="Rotation Y" part="lowerArm" axis="y" value={poseControls.lowerArm.y} />
                        <SliderGroup label="Rotation Z" part="lowerArm" axis="z" value={poseControls.lowerArm.z} />
                    </div>
                </div>
            )}

            <div className="emotion-section">
                <h3>Respiration</h3>
                <div className="slider-row">
                    <label>
                        <input
                            type="checkbox"
                            checked={breathingEnabled}
                            onChange={(e) => setBreathingEnabled(e.target.checked)}
                            style={{ marginRight: '8px' }}
                        />
                        Respiration activée
                    </label>
                </div>
                <div className="slider-row">
                    <label>Rythme ({breathingRate.toFixed(0)} resp/min)</label>
                    <input
                        type="range"
                        min="8"
                        max="30"
                        step="1"
                        value={breathingRate}
                        onChange={(e) => setBreathingRate(parseFloat(e.target.value))}
                        disabled={!breathingEnabled}
                    />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
                    💡 Le rythme s'adapte aux émotions automatiquement
                </div>
            </div>

            <div className="emotion-section">
                <h3>Lip Sync Tuning</h3>
                <div className="slider-row">
                    <label>Sensibilité ({lipSyncSensitivity.toFixed(1)})</label>
                    <input
                        type="range"
                        min="0.1"
                        max="5.0"
                        step="0.1"
                        value={lipSyncSensitivity}
                        onChange={(e) => setLipSyncSettings({ sensitivity: parseFloat(e.target.value) })}
                    />
                </div>
                <div className="slider-row">
                    <label>Lissage ({lipSyncSmoothing.toFixed(2)})</label>
                    <input
                        type="range"
                        min="0.01"
                        max="1.5"
                        step="0.01"
                        value={lipSyncSmoothing}
                        onChange={(e) => setLipSyncSettings({ smoothing: parseFloat(e.target.value) })}
                    />
                </div>
                <div className="slider-row">
                    <label>Seuil de Bruit ({lipSyncNoiseFloor.toFixed(2)})</label>
                    <input
                        type="range"
                        min="0.0"
                        max="0.2"
                        step="0.01"
                        value={lipSyncNoiseFloor}
                        onChange={(e) => setLipSyncSettings({ noiseFloor: parseFloat(e.target.value) })}
                    />
                </div>
                <div className="slider-row">
                    <label>Seuil Sibilantes ({lipSyncSibilantThreshold.toFixed(1)})</label>
                    <input
                        type="range"
                        min="0.5"
                        max="3.0"
                        step="0.1"
                        value={lipSyncSibilantThreshold}
                        onChange={(e) => setLipSyncSettings({ sibilantThreshold: parseFloat(e.target.value) })}
                    />
                </div>
                <div className="slider-row">
                    <label>Seuil Fermeture ({lipSyncClosedThreshold.toFixed(2)})</label>
                    <input
                        type="range"
                        min="0.05"
                        max="0.5"
                        step="0.01"
                        value={lipSyncClosedThreshold}
                        onChange={(e) => setLipSyncSettings({ closedThreshold: parseFloat(e.target.value) })}
                    />
                </div>
            </div>

            <div className="emotion-section">
                <h3>Émotions</h3>

                <div className="emotion-grid">
                    {emotions.map((emotion) => (
                        <div key={emotion.name} className="emotion-control">
                            <button
                                className="emotion-button"
                                style={{ borderColor: emotion.color }}
                                onClick={() => handleEmotionClick(emotion.name)}
                                title={emotion.label}
                            >
                                {emotion.label}
                            </button>
                            <div className="slider-row emotion-intensity-slider">
                                <label style={{ fontSize: '0.8rem' }}>
                                    Intensité: {emotionIntensities[emotion.name as keyof typeof emotionIntensities].toFixed(1)}
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="3.0"
                                    step="0.1"
                                    value={emotionIntensities[emotion.name as keyof typeof emotionIntensities]}
                                    onChange={(e) => handleEmotionIntensityChange(emotion.name, parseFloat(e.target.value))}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
