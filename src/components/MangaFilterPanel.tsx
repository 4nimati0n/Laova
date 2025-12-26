import React from 'react';
import { Sparkles, Palette, Grid, Droplet, Aperture, FileText } from 'lucide-react';
import type { MangaFilters } from '../hooks/useMangaFilter';
import '../styles/MangaFilterPanel.css';

interface MangaFilterPanelProps {
    filters: MangaFilters;
    onUpdate: <K extends keyof MangaFilters>(
        filterName: K,
        updates: Partial<MangaFilters[K]>
    ) => void;
}

export const MangaFilterPanel: React.FC<MangaFilterPanelProps> = ({ filters, onUpdate }) => {
    return (
        <div className="manga-filter-panel">
            <h3 className="panel-title">Filtres Manga</h3>

            {/* CSS Manga */}
            <div className="filter-section">
                <div className="filter-header">
                    <label className="filter-toggle-label">
                        <input
                            type="checkbox"
                            checked={filters.cssManga.enabled}
                            onChange={(e) => onUpdate('cssManga', { enabled: e.target.checked })}
                        />
                        <Sparkles size={16} />
                        <span>CSS Manga</span>
                    </label>
                </div>

                {filters.cssManga.enabled && (
                    <div className="filter-params">
                        <div className="param">
                            <label>
                                Contraste
                                <span className="param-value">{filters.cssManga.contrast.toFixed(2)}</span>
                            </label>
                            <input
                                type="range"
                                min="1.0"
                                max="2.5"
                                step="0.1"
                                value={filters.cssManga.contrast}
                                onChange={(e) => onUpdate('cssManga', { contrast: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div className="param">
                            <label>
                                Saturation
                                <span className="param-value">{filters.cssManga.saturation.toFixed(2)}</span>
                            </label>
                            <input
                                type="range"
                                min="0.8"
                                max="2.0"
                                step="0.1"
                                value={filters.cssManga.saturation}
                                onChange={(e) => onUpdate('cssManga', { saturation: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div className="param">
                            <label>
                                Luminosité
                                <span className="param-value">{filters.cssManga.brightness.toFixed(2)}</span>
                            </label>
                            <input
                                type="range"
                                min="0.8"
                                max="1.3"
                                step="0.05"
                                value={filters.cssManga.brightness}
                                onChange={(e) => onUpdate('cssManga', { brightness: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div className="param">
                            <label>
                                Teinte
                                <span className="param-value">{filters.cssManga.hueRotate}°</span>
                            </label>
                            <input
                                type="range"
                                min="-20"
                                max="20"
                                step="1"
                                value={filters.cssManga.hueRotate}
                                onChange={(e) => onUpdate('cssManga', { hueRotate: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Cel-Shading */}
            <div className="filter-section">
                <div className="filter-header">
                    <label className="filter-toggle-label">
                        <input
                            type="checkbox"
                            checked={filters.celShading.enabled}
                            onChange={(e) => onUpdate('celShading', { enabled: e.target.checked })}
                        />
                        <Palette size={16} />
                        <span>Cel-Shading</span>
                    </label>
                </div>

                {filters.celShading.enabled && (
                    <div className="filter-params">
                        <div className="param">
                            <label>
                                Posterisation
                                <span className="param-value">{filters.celShading.posterizeLevels}</span>
                            </label>
                            <input
                                type="range"
                                min="3"
                                max="12"
                                step="1"
                                value={filters.celShading.posterizeLevels}
                                onChange={(e) => onUpdate('celShading', { posterizeLevels: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="param">
                            <label>
                                Seuil Contours
                                <span className="param-value">{filters.celShading.edgeThreshold.toFixed(2)}</span>
                            </label>
                            <input
                                type="range"
                                min="0.05"
                                max="0.4"
                                step="0.01"
                                value={filters.celShading.edgeThreshold}
                                onChange={(e) => onUpdate('celShading', { edgeThreshold: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div className="param">
                            <label>
                                Épaisseur
                                <span className="param-value">{filters.celShading.edgeWidth.toFixed(1)}</span>
                            </label>
                            <input
                                type="range"
                                min="0.3"
                                max="2.0"
                                step="0.1"
                                value={filters.celShading.edgeWidth}
                                onChange={(e) => onUpdate('celShading', { edgeWidth: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Halftone */}
            <div className="filter-section">
                <div className="filter-header">
                    <label className="filter-toggle-label">
                        <input
                            type="checkbox"
                            checked={filters.halftone.enabled}
                            onChange={(e) => onUpdate('halftone', { enabled: e.target.checked })}
                        />
                        <Grid size={16} />
                        <span>Halftone</span>
                    </label>
                </div>

                {filters.halftone.enabled && (
                    <div className="filter-params">
                        <div className="param">
                            <label>
                                Taille Points
                                <span className="param-value">{filters.halftone.dotSize}</span>
                            </label>
                            <input
                                type="range"
                                min="2"
                                max="10"
                                step="1"
                                value={filters.halftone.dotSize}
                                onChange={(e) => onUpdate('halftone', { dotSize: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="param">
                            <label>
                                Densité
                                <span className="param-value">{filters.halftone.density.toFixed(1)}</span>
                            </label>
                            <input
                                type="range"
                                min="0.5"
                                max="1.5"
                                step="0.1"
                                value={filters.halftone.density}
                                onChange={(e) => onUpdate('halftone', { density: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div className="param">
                            <label>
                                Angle
                                <span className="param-value">{filters.halftone.angle}°</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="90"
                                step="5"
                                value={filters.halftone.angle}
                                onChange={(e) => onUpdate('halftone', { angle: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Color Boost */}
            <div className="filter-section">
                <div className="filter-header">
                    <label className="filter-toggle-label">
                        <input
                            type="checkbox"
                            checked={filters.colorBoost.enabled}
                            onChange={(e) => onUpdate('colorBoost', { enabled: e.target.checked })}
                        />
                        <Droplet size={16} />
                        <span>Color Boost</span>
                    </label>
                </div>

                {filters.colorBoost.enabled && (
                    <div className="filter-params">
                        <div className="param">
                            <label>
                                Intensité
                                <span className="param-value">{filters.colorBoost.intensity.toFixed(1)}</span>
                            </label>
                            <input
                                type="range"
                                min="1.0"
                                max="2.5"
                                step="0.1"
                                value={filters.colorBoost.intensity}
                                onChange={(e) => onUpdate('colorBoost', { intensity: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div className="param">
                            <label>
                                Boost Roses
                                <span className="param-value">{filters.colorBoost.pinkBoost.toFixed(1)}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={filters.colorBoost.pinkBoost}
                                onChange={(e) => onUpdate('colorBoost', { pinkBoost: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div className="param">
                            <label>
                                Boost Bleus
                                <span className="param-value">{filters.colorBoost.blueBoost.toFixed(1)}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={filters.colorBoost.blueBoost}
                                onChange={(e) => onUpdate('colorBoost', { blueBoost: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Vignette */}
            <div className="filter-section">
                <div className="filter-header">
                    <label className="filter-toggle-label">
                        <input
                            type="checkbox"
                            checked={filters.vignette.enabled}
                            onChange={(e) => onUpdate('vignette', { enabled: e.target.checked })}
                        />
                        <Aperture size={16} />
                        <span>Vignette</span>
                    </label>
                </div>

                {filters.vignette.enabled && (
                    <div className="filter-params">
                        <div className="param">
                            <label>
                                Intensité
                                <span className="param-value">{filters.vignette.intensity.toFixed(2)}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={filters.vignette.intensity}
                                onChange={(e) => onUpdate('vignette', { intensity: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div className="param">
                            <label>
                                Rayon
                                <span className="param-value">{filters.vignette.radius.toFixed(2)}</span>
                            </label>
                            <input
                                type="range"
                                min="0.3"
                                max="1.0"
                                step="0.05"
                                value={filters.vignette.radius}
                                onChange={(e) => onUpdate('vignette', { radius: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div className="param">
                            <label>
                                Douceur
                                <span className="param-value">{filters.vignette.softness.toFixed(2)}</span>
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="0.8"
                                step="0.05"
                                value={filters.vignette.softness}
                                onChange={(e) => onUpdate('vignette', { softness: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Paper Grain */}
            <div className="filter-section">
                <div className="filter-header">
                    <label className="filter-toggle-label">
                        <input
                            type="checkbox"
                            checked={filters.paperGrain.enabled}
                            onChange={(e) => onUpdate('paperGrain', { enabled: e.target.checked })}
                        />
                        <FileText size={16} />
                        <span>Grain Papier</span>
                    </label>
                </div>

                {filters.paperGrain.enabled && (
                    <div className="filter-params">
                        <div className="param">
                            <label>
                                Intensité
                                <span className="param-value">{filters.paperGrain.intensity.toFixed(2)}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="0.3"
                                step="0.01"
                                value={filters.paperGrain.intensity}
                                onChange={(e) => onUpdate('paperGrain', { intensity: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div className="param">
                            <label>
                                Taille Grain
                                <span className="param-value">{filters.paperGrain.size}</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                step="1"
                                value={filters.paperGrain.size}
                                onChange={(e) => onUpdate('paperGrain', { size: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="param">
                            <label>
                                Contraste
                                <span className="param-value">{filters.paperGrain.contrast.toFixed(1)}</span>
                            </label>
                            <input
                                type="range"
                                min="0.5"
                                max="2.0"
                                step="0.1"
                                value={filters.paperGrain.contrast}
                                onChange={(e) => onUpdate('paperGrain', { contrast: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
