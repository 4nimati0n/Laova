// Visualization Settings Panel
// Allows users to configure the inner visualization system

import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { DEFAULT_VISUALIZATION_STYLE } from '../utils/falai';
import '../styles/VisualizationSettings.css';

export const VisualizationSettings = () => {
    const {
        visualizationStyle,
        setVisualizationStyle,
        setIsVisualizationSettingsOpen
    } = useAppStore();

    const [localStyle, setLocalStyle] = useState(visualizationStyle);

    const handleSave = () => {
        setVisualizationStyle(localStyle);
        setIsVisualizationSettingsOpen(false);
    };

    const handleReset = () => {
        setLocalStyle(DEFAULT_VISUALIZATION_STYLE);
    };

    const handleSliderChange = (key: keyof typeof localStyle, value: number) => {
        setLocalStyle(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="settings-overlay">
            <div className="settings-modal visualization-settings">
                <div className="settings-header">
                    <h2><Sparkles size={20} /> Visualisation Intérieure</h2>
                    <button onClick={() => setIsVisualizationSettingsOpen(false)} className="close-button">
                        <X size={24} />
                    </button>
                </div>

                <div className="settings-content">
                    <p className="help-text" style={{ marginBottom: '20px' }}>
                        Ajuste le style visuel de l'imagination de Laura
                    </p>

                    <div className="slider-group">
                        <label>
                            <span>Aspect Rêveur</span>
                            <span className="slider-value">{Math.round(localStyle.dreaminess * 100)}%</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={Math.round(localStyle.dreaminess * 100)}
                            onChange={(e) => handleSliderChange('dreaminess', Number(e.target.value) / 100)}
                        />
                        <p className="slider-hint">Plus élevé = plus flou et éthéré</p>
                    </div>

                    <div className="slider-group">
                        <label>
                            <span>Chaleur</span>
                            <span className="slider-value">{Math.round(localStyle.warmth * 100)}%</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={Math.round(localStyle.warmth * 100)}
                            onChange={(e) => handleSliderChange('warmth', Number(e.target.value) / 100)}
                        />
                        <p className="slider-hint">0% = tons froids, 100% = tons chauds dorés</p>
                    </div>

                    <div className="slider-group">
                        <label>
                            <span>Saturation</span>
                            <span className="slider-value">{Math.round(localStyle.saturation * 100)}%</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={Math.round(localStyle.saturation * 100)}
                            onChange={(e) => handleSliderChange('saturation', Number(e.target.value) / 100)}
                        />
                        <p className="slider-hint">Intensité des couleurs</p>
                    </div>

                    <div className="slider-group">
                        <label>
                            <span>Style Anime</span>
                            <span className="slider-value">{Math.round(localStyle.animeLevel * 100)}%</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={Math.round(localStyle.animeLevel * 100)}
                            onChange={(e) => handleSliderChange('animeLevel', Number(e.target.value) / 100)}
                        />
                        <p className="slider-hint">0% = semi-réaliste, 100% = pur anime</p>
                    </div>

                    <div className="slider-group">
                        <label>
                            <span>Mode d'affichage</span>
                        </label>
                        <div className="toggle-buttons">
                            <button
                                className={`toggle-btn ${localStyle.displayMode === 'above_head' ? 'active' : ''}`}
                                onClick={() => setLocalStyle(prev => ({ ...prev, displayMode: 'above_head' }))}
                            >
                                🎯 Au-dessus de la tête
                            </button>
                            <button
                                className={`toggle-btn ${localStyle.displayMode === 'fullscreen' ? 'active' : ''}`}
                                onClick={() => setLocalStyle(prev => ({ ...prev, displayMode: 'fullscreen' }))}
                            >
                                🖼️ Plein écran
                            </button>
                        </div>
                        <p className="slider-hint">
                            {localStyle.displayMode === 'above_head'
                                ? "Image circulaire au-dessus de Laura (résolution 512x512)"
                                : "Image en fond d'écran (résolution 1280x720)"
                            }
                        </p>
                    </div>
                </div>

                <div className="settings-footer">
                    <button onClick={handleReset} className="reset-button">
                        Réinitialiser
                    </button>
                    <button onClick={handleSave} className="save-button">
                        <Sparkles size={16} />
                        Appliquer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VisualizationSettings;
