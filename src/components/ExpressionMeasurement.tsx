import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Camera, CameraOff, Activity, Heart, Smile } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { EmpathicScene } from './EmpathicScene';
import { EmotionTuningPanel } from './EmotionTuningPanel';
import { MangaFilterPanel } from './MangaFilterPanel';
import type { EmotionTuningParams } from '../utils/emotionTuning';
import { DEFAULT_TUNING } from '../utils/emotionTuning';
import type { CompassionParams } from '../utils/compassionMapping';
import { DEFAULT_COMPASSION } from '../utils/compassionMapping';
import { useFaceDetection } from '../hooks/useFaceDetection';
import { useMangaFilter } from '../hooks/useMangaFilter';
import '../styles/ExpressionMeasurement.css';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export const ExpressionMeasurement = () => {
    const { setCurrentPage } = useAppStore();

    const [isCameraActive, setIsCameraActive] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const [error, setError] = useState<string | null>(null);

    // Use FREE local face detection instead of expensive Hume API
    const {
        isReady: faceApiReady,
        isDetecting,
        emotions,
        error: faceApiError,
        startDetection,
        stopDetection,
    } = useFaceDetection({ interval: 150 });

    // Manga filter effects (6 effects with parameters)
    const {
        filters,
        updateFilter,
        cssFilterStyle,
        canvasRef: mangaCanvasRef,
        startRendering,
        stopRendering,
    } = useMangaFilter();

    // Emotion tuning state
    const [tuningParams, setTuningParams] = useState<EmotionTuningParams>(DEFAULT_TUNING);
    const [vrmExpressions, setVrmExpressions] = useState({
        happy: 0,
        angry: 0,
        sad: 0,
        surprised: 0,
        fun: 0,
        neutral: 0,
    });
    const [rawExpressions, setRawExpressions] = useState({
        happy: 0,
        angry: 0,
        sad: 0,
        surprised: 0,
        fun: 0,
        neutral: 0,
    });
    const [isTuningPanelOpen, setIsTuningPanelOpen] = useState(true);

    // Compassion mode state
    const [compassionParams, setCompassionParams] = useState<CompassionParams>(DEFAULT_COMPASSION);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Update connection status based on face detection state
    useEffect(() => {
        if (isDetecting) {
            setConnectionStatus('connected');
        } else if (faceApiReady && isCameraActive) {
            setConnectionStatus('connecting');
        } else {
            setConnectionStatus('disconnected');
        }
    }, [isDetecting, faceApiReady, isCameraActive]);

    // Manage WebGL rendering based on filter state and camera state
    useEffect(() => {
        const anyWebGLFilterActive = filters.celShading.enabled || filters.halftone.enabled ||
            filters.colorBoost.enabled || filters.vignette.enabled || filters.paperGrain.enabled;

        if (anyWebGLFilterActive && isCameraActive && videoRef.current) {
            startRendering(videoRef.current);
        } else {
            stopRendering();
        }
    }, [
        filters.celShading.enabled,
        filters.halftone.enabled,
        filters.colorBoost.enabled,
        filters.vignette.enabled,
        filters.paperGrain.enabled,
        isCameraActive,
        startRendering,
        stopRendering
    ]);

    // Handle face-api errors
    useEffect(() => {
        if (faceApiError) {
            setError(faceApiError);
        }
    }, [faceApiError]);

    // Start camera and detection
    const startCamera = useCallback(async () => {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' },
                audio: false
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setIsCameraActive(true);

                // Start face detection when video is ready
                videoRef.current.onloadedmetadata = () => {
                    if (videoRef.current && faceApiReady) {
                        startDetection(videoRef.current);
                    }
                };
            }
        } catch (err) {
            console.error('Camera error:', err);
            setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
        }
    }, [faceApiReady, startDetection]);

    // Stop camera and detection
    const stopCamera = useCallback(() => {
        stopDetection();
        stopRendering();

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
    }, [stopDetection, stopRendering]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    const handleCameraToggle = () => {
        if (isCameraActive) {
            stopCamera();
        } else {
            startCamera();
        }
    };

    const getStatusText = () => {
        switch (connectionStatus) {
            case 'connected': return 'Connecté';
            case 'connecting': return 'Connexion...';
            default: return 'Déconnecté';
        }
    };

    return (
        <div className="empathic-mirror-page">

            {/* Header */}
            <div className="mirror-header">
                <button className="back-button" onClick={() => setCurrentPage('home')}>
                    <ArrowLeft size={18} />
                    Retour
                </button>
                <div className="page-title">
                    <Heart size={24} />
                    Miroir Empathique
                </div>
                <div className="header-spacer" />
            </div>

            {/* Main split layout */}
            <div className="mirror-content">
                {/* Left Panel - Camera & Emotions */}
                <div className="left-panel">
                    {/* Camera Section */}
                    <div className="camera-section">
                        <div className="camera-preview">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{
                                    // When WebGL filters are on, we hide the video but keep it rendering
                                    // display: none stops playback in some browsers
                                    position: 'relative',
                                    opacity: 1,
                                    zIndex: 1,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transform: 'scaleX(-1)',
                                    filter: cssFilterStyle,
                                }}
                            />
                            {/* WebGL Manga filters canvas overlay */}
                            <canvas
                                ref={mangaCanvasRef}
                                className="cel-shading-canvas"
                                style={{
                                    display: isCameraActive ? 'block' : 'none',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    zIndex: 2,
                                    filter: cssFilterStyle, // Apply CSS filter to WebGL canvas too
                                }}
                            />
                            {!isCameraActive && (
                                <div className="camera-placeholder">
                                    <Camera size={48} />
                                    <span>Caméra inactive</span>
                                </div>
                            )}
                        </div>
                        <button
                            className={`camera-toggle ${isCameraActive ? 'active' : ''}`}
                            onClick={handleCameraToggle}
                        >
                            {isCameraActive ? (
                                <>
                                    <CameraOff size={18} />
                                    Désactiver
                                </>
                            ) : (
                                <>
                                    <Camera size={18} />
                                    Activer la caméra
                                </>
                            )}
                        </button>
                    </div>

                    {/* Emotions Section */}
                    <div className="emotions-section">
                        <div className={`connection-status ${connectionStatus}`}>
                            <span className="status-dot" />
                            {getStatusText()}
                        </div>

                        <h3>
                            <Activity size={18} />
                            Émotions Détectées
                        </h3>

                        {emotions.length > 0 ? (
                            <div className="emotion-list">
                                {emotions.slice(0, 15).map((emotion) => (
                                    <div key={emotion.name} className="emotion-item">
                                        <div className="emotion-header">
                                            <span className="emotion-name">{emotion.name}</span>
                                            <span className="emotion-score">
                                                {(emotion.score * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="emotion-bar-bg">
                                            <div
                                                className="emotion-bar"
                                                style={{ width: `${emotion.score * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-emotions">
                                <Smile size={36} />
                                <p>Activez la caméra pour détecter vos émotions</p>
                            </div>
                        )}

                        {error && <div className="error-message">{error}</div>}
                    </div>
                </div>

                {/* Middle Panel - Manga Filters */}
                <div className="middle-panel">
                    <MangaFilterPanel
                        filters={filters}
                        onUpdate={updateFilter}
                    />
                </div>

                {/* Right Panel - Sarra VRM */}
                <div className="right-panel">
                    <EmpathicScene
                        emotions={emotions}
                        tuningParams={tuningParams}
                        compassionParams={compassionParams}
                        onVrmExpressionsChange={(expr) => setVrmExpressions({
                            happy: expr.happy ?? 0,
                            angry: expr.angry ?? 0,
                            sad: expr.sad ?? 0,
                            surprised: expr.surprised ?? 0,
                            fun: expr.fun ?? 0,
                            neutral: expr.neutral ?? 0,
                        })}
                        onRawExpressionsChange={(expr) => setRawExpressions({
                            happy: expr.happy ?? 0,
                            angry: expr.angry ?? 0,
                            sad: expr.sad ?? 0,
                            surprised: expr.surprised ?? 0,
                            fun: expr.fun ?? 0,
                            neutral: expr.neutral ?? 0,
                        })}
                    />
                </div>

                {/* Tuning Panel */}
                <EmotionTuningPanel
                    tuning={tuningParams}
                    onTuningChange={setTuningParams}
                    compassion={compassionParams}
                    onCompassionChange={setCompassionParams}
                    vrmExpressions={vrmExpressions}
                    rawExpressions={rawExpressions}
                    isOpen={isTuningPanelOpen}
                    onToggle={() => setIsTuningPanelOpen(!isTuningPanelOpen)}
                />
            </div>
        </div>
    );
};
