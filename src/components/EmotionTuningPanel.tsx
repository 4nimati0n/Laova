import { Sliders, RotateCcw, Eye, Heart, Users, Scale } from 'lucide-react';
import type { EmotionTuningParams } from '../utils/emotionTuning';
import { TUNING_SLIDER_CONFIG, DEFAULT_TUNING } from '../utils/emotionTuning';
import type { CompassionParams } from '../utils/compassionMapping';
import { COMPASSION_SLIDER_CONFIG } from '../utils/compassionMapping';
import '../styles/EmotionTuningPanel.css';

interface VrmExpressionValues {
    happy: number;
    angry: number;
    sad: number;
    surprised: number;
    fun: number;
    neutral: number;
}

interface EmotionTuningPanelProps {
    tuning: EmotionTuningParams;
    onTuningChange: (tuning: EmotionTuningParams) => void;
    compassion: CompassionParams;
    onCompassionChange: (compassion: CompassionParams) => void;
    vrmExpressions: VrmExpressionValues;
    rawExpressions?: VrmExpressionValues;
    isOpen: boolean;
    onToggle: () => void;
}

export const EmotionTuningPanel = ({
    tuning,
    onTuningChange,
    compassion,
    onCompassionChange,
    vrmExpressions,
    rawExpressions,
    isOpen,
    onToggle,
}: EmotionTuningPanelProps) => {
    const handleSliderChange = (key: keyof EmotionTuningParams, value: number) => {
        onTuningChange({
            ...tuning,
            [key]: value,
        });
    };

    const handleReset = () => {
        onTuningChange(DEFAULT_TUNING);
    };

    // Get expression bar color based on emotion type
    const getExpressionColor = (name: string): string => {
        const colors: Record<string, string> = {
            happy: '#FFD93D',
            angry: '#FF6B6B',
            sad: '#6BCFFF',
            surprised: '#C9B1FF',
            fun: '#95E1A3',
            neutral: '#A0A0A0',
        };
        return colors[name] || '#888';
    };

    if (!isOpen) {
        return (
            <button className="tuning-toggle-btn" onClick={onToggle} title="Réglages des émotions">
                <Sliders size={20} />
            </button>
        );
    }

    return (
        <div className="emotion-tuning-panel">
            <div className="tuning-header">
                <h3>
                    <Sliders size={16} />
                    Réglages
                </h3>
                <div className="header-actions">
                    <button className="reset-btn" onClick={handleReset} title="Réinitialiser">
                        <RotateCcw size={14} />
                    </button>
                    <button className="close-btn" onClick={onToggle}>
                        ×
                    </button>
                </div>
            </div>

            {/* VRM Expression Debug Display - Dual Bar (raw + smoothed) */}
            <div className="vrm-expressions-section">
                <div className="section-title">
                    <Eye size={14} />
                    Expressions VRM
                    <span className="legend">
                        <span className="legend-raw">╌ brut</span>
                        <span className="legend-smooth">█ lissé</span>
                    </span>
                </div>
                <div className="expression-bars">
                    {Object.entries(vrmExpressions).map(([name, smoothedValue]) => {
                        const expressionName = name as keyof VrmExpressionValues;
                        const rawValue = rawExpressions ? rawExpressions[expressionName] : smoothedValue;
                        const color = getExpressionColor(name);

                        return (
                            <div key={name} className="expression-row">
                                <span className="expression-label">{name}</span>
                                <div className="expression-bar-container">
                                    {/* Smoothed bar (filled) */}
                                    <div
                                        className="expression-bar-fill"
                                        style={{
                                            width: `${Math.min(100, smoothedValue * 100)}%`,
                                            backgroundColor: color,
                                        }}
                                    />
                                    {/* Raw indicator (thin line) */}
                                    {rawExpressions && (
                                        <div
                                            className="expression-raw-marker"
                                            style={{
                                                left: `${Math.min(100, rawValue * 100)}%`,
                                                backgroundColor: color,
                                            }}
                                        />
                                    )}
                                </div>
                                <span className="expression-value">{(smoothedValue * 100).toFixed(0)}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Response Mode Toggle */}
            <div className="compassion-mode-section">
                <div className="section-title">
                    <Heart size={14} />
                    Mode de réponse
                </div>
                <div className="mode-toggle-group">
                    <button
                        className={`mode-btn ${compassion.responseMode === 'empathy' ? 'active' : ''}`}
                        onClick={() => onCompassionChange({ ...compassion, responseMode: 'empathy' })}
                        title="Laura reflète vos émotions"
                    >
                        <Users size={14} />
                        Empathie
                    </button>
                    <button
                        className={`mode-btn ${compassion.responseMode === 'balanced' ? 'active' : ''}`}
                        onClick={() => onCompassionChange({ ...compassion, responseMode: 'balanced' })}
                        title="Mélange empathie + compassion"
                    >
                        <Scale size={14} />
                        Équilibré
                    </button>
                    <button
                        className={`mode-btn ${compassion.responseMode === 'compassion' ? 'active' : ''}`}
                        onClick={() => onCompassionChange({ ...compassion, responseMode: 'compassion' })}
                        title="Laura offre des émotions guérissantes"
                    >
                        <Heart size={14} />
                        Compassion
                    </button>
                </div>

                {/* Compassion Sliders */}
                {(Object.keys(COMPASSION_SLIDER_CONFIG) as Array<keyof typeof COMPASSION_SLIDER_CONFIG>).map(
                    (key) => {
                        const config = COMPASSION_SLIDER_CONFIG[key];
                        const value = compassion[key];
                        const displayValue = `${(value * 100).toFixed(0)}%`;

                        return (
                            <div key={key} className="slider-row compassion-slider">
                                <div className="slider-header">
                                    <span className="slider-label">{config.label}</span>
                                    <span className="slider-value compassion-value">{displayValue}</span>
                                </div>
                                <input
                                    type="range"
                                    min={config.min}
                                    max={config.max}
                                    step={config.step}
                                    value={value}
                                    onChange={(e) => onCompassionChange({
                                        ...compassion,
                                        [key]: parseFloat(e.target.value),
                                    })}
                                    className="tuning-slider compassion-slider-input"
                                />
                                <div className="slider-description">{config.description}</div>
                            </div>
                        );
                    }
                )}
            </div>

            {/* Tuning Sliders */}
            <div className="tuning-sliders-section">
                {(Object.keys(TUNING_SLIDER_CONFIG) as Array<keyof typeof TUNING_SLIDER_CONFIG>).map(
                    (key) => {
                        const config = TUNING_SLIDER_CONFIG[key];
                        const value = tuning[key];
                        const displayValue = key === 'threshold'
                            ? `${(value * 100).toFixed(0)}%`
                            : value.toFixed(1);

                        return (
                            <div key={key} className="slider-row">
                                <div className="slider-header">
                                    <span className="slider-label">{config.label}</span>
                                    <span className="slider-value">{displayValue}</span>
                                </div>
                                <input
                                    type="range"
                                    min={config.min}
                                    max={config.max}
                                    step={config.step}
                                    value={value}
                                    onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
                                    className="tuning-slider"
                                />
                                <div className="slider-description">{config.description}</div>
                            </div>
                        );
                    }
                )}
            </div>
        </div>
    );
};
