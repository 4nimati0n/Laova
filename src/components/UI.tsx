import { Play, Pause, Settings as SettingsIcon, Maximize, Minimize, Image, Expand, Users, Eye } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useState, useEffect } from 'react';
import { EnergyDisplay } from './EnergyDisplay';
import { EnergyModal } from './EnergyModal';
import { GazeDebugPanel } from './GazeDebugPanel';

export const UI = () => {
    const {
        isPlaying,
        setIsPlaying,
        isListening,
        isSpeaking,
        error,
        setIsSettingsOpen,
        userMessage,
        aiResponse,
        lastAudioBuffer,
        showConversation,
        visualizationEnabled,
        visualizationStyle,
        setVisualizationStyle,
        gazeDebugEnabled,
        setGazeDebugEnabled,
        currentModel,
        setCurrentModel,
        setCurrentPage
    } = useAppStore();

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isUIVisible, setIsUIVisible] = useState(true);

    const displayMode = visualizationStyle?.displayMode || 'above_head';

    const toggleDisplayMode = () => {
        const newMode = displayMode === 'above_head' ? 'fullscreen' : 'above_head';
        setVisualizationStyle({ displayMode: newMode });
    };

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        const handleMouseMove = () => {
            setIsUIVisible(true);
            document.body.style.cursor = 'auto';
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIsUIVisible(false);
                document.body.style.cursor = 'none';
            }, 2000);
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Initial timeout start
        timeoutId = setTimeout(() => {
            setIsUIVisible(false);
            document.body.style.cursor = 'none';
        }, 2000);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timeoutId);
            document.body.style.cursor = 'auto'; // Reset on unmount
        };
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.error('Fullscreen error:', err);
        }
    };

    return (
        <>
            <div
                className="ui-overlay"
                style={{
                    opacity: isUIVisible ? 1 : 0,
                    transition: 'opacity 0.5s ease-in-out'
                }}
            >
                <div className="status-bar">
                    <div className={`status-indicator ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}>
                        {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready'}
                    </div>

                    {/* Energy Display - Centered */}
                    <EnergyDisplay />

                    <div className="top-right-buttons">
                        {/* Expression Measurement Test Button */}
                        <button
                            className="icon-button"
                            onClick={() => setCurrentPage('expression-measurement')}
                            title="Test Expression Measurement"
                            style={{
                                background: 'rgba(100, 200, 150, 0.2)',
                                borderColor: 'rgba(100, 200, 150, 0.4)'
                            }}
                        >
                            <Eye size={20} />
                        </button>

                        {/* Model Switcher Button */}
                        <button
                            className="icon-button model-switcher"
                            onClick={() => setCurrentModel(currentModel === 'laura' ? 'lea' : 'laura')}
                            title={`Changer vers ${currentModel === 'laura' ? 'Lea' : 'Laura'}`}
                            style={{
                                background: currentModel === 'lea' ? 'rgba(147, 112, 219, 0.3)' : 'rgba(255, 182, 193, 0.2)',
                                borderColor: currentModel === 'lea' ? 'rgba(147, 112, 219, 0.5)' : 'rgba(255, 182, 193, 0.4)'
                            }}
                        >
                            <Users size={20} />
                            <span className="model-name">{currentModel === 'laura' ? 'Laura' : 'Lea'}</span>
                        </button>

                        {/* Visualization mode toggle - only show if visualization is enabled */}
                        {visualizationEnabled && (
                            <button
                                className="icon-button"
                                onClick={toggleDisplayMode}
                                title={displayMode === 'above_head' ? "Passer en plein écran" : "Passer en bulle"}
                                style={{
                                    background: 'rgba(255, 182, 193, 0.2)',
                                    borderColor: 'rgba(255, 182, 193, 0.4)'
                                }}
                            >
                                {displayMode === 'above_head' ? <Expand size={20} /> : <Image size={20} />}
                            </button>
                        )}
                        <button
                            className="icon-button"
                            onClick={toggleFullscreen}
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        >
                            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </button>
                        <button
                            className="settings-trigger"
                            onClick={() => setIsSettingsOpen(true)}
                            title="Settings"
                        >
                            <SettingsIcon size={20} />
                        </button>
                    </div>
                </div>

                {/* Conversation text under buttons */}
                {showConversation && (
                    <div className="conversation-overlay">
                        {userMessage && (
                            <div className="message-bubble user-bubble">
                                <span className="message-label">You</span>
                                <p>{userMessage}</p>
                            </div>
                        )}
                        {aiResponse && (
                            <div className="message-bubble ai-bubble">
                                <span className="message-label">Laura</span>
                                <p>{aiResponse}</p>
                                {lastAudioBuffer && !isSpeaking && (
                                    <button
                                        className="replay-button"
                                        onClick={() => window.dispatchEvent(new CustomEvent('replay-audio'))}
                                        title="Rejouer le message"
                                    >
                                        ↺ Replay
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="error-banner">
                        {error}
                    </div>
                )}

                <div className="controls">
                    <button
                        className={`play-button ${isPlaying ? 'playing' : ''}`}
                        onClick={() => setIsPlaying(!isPlaying)}
                    >
                        {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                    </button>
                </div>
            </div>

            {/* Energy Modal - rendered outside ui-overlay for proper z-index */}
            <EnergyModal />

            {/* Gaze Debug Panel */}
            <GazeDebugPanel />

            {/* Debug Toggle Button (bottom-left) */}
            <button
                onClick={() => setGazeDebugEnabled(!gazeDebugEnabled)}
                style={{
                    position: 'fixed',
                    bottom: '10px',
                    left: '10px',
                    padding: '8px 12px',
                    background: gazeDebugEnabled ? '#0f0' : 'rgba(0,0,0,0.7)',
                    color: gazeDebugEnabled ? '#000' : '#fff',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    zIndex: 9998,
                    fontFamily: 'monospace'
                }}
            >
                🎯 {gazeDebugEnabled ? 'Debug ON' : 'Debug'}
            </button>
        </>
    );
};
