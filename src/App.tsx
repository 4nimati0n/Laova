import { Scene } from './components/Scene';
import { useEffect } from 'react';
import { UI } from './components/UI';
import { Settings } from './components/Settings';
import { PoseControls } from './components/PoseControls';
import { InnerVisualization } from './components/InnerVisualization';
import { VisualizationSettings } from './components/VisualizationSettings';
import { useVoiceInteraction } from './hooks/useVoiceInteraction';
import { useAppStore } from './store/useAppStore';
import './styles/PoseControls.css';

function App() {
  // Initialize voice interaction hook
  useVoiceInteraction();
  const { isSettingsOpen, isVisualizationSettingsOpen, userMessage, aiResponse } = useAppStore();

  // DEBUG: Log clicked element
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      console.log('🖱️ Clicked on:', (e.target as HTMLElement).tagName, 'Class:', (e.target as HTMLElement).className, 'ID:', (e.target as HTMLElement).id);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="app-container">
      {/* Inner Visualization Background */}
      <InnerVisualization />

      {/* Main Content */}
      <div className="main-content" style={{ position: 'relative', width: '100%', height: '100%' }}>

        {/* Chat Overlay - zIndex: 1 */}
        <div className="chat-overlay" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          {userMessage && (
            <div className="message user-message" style={{ pointerEvents: 'auto' }}>
              <p>{userMessage}</p>
            </div>
          )}
          {aiResponse && (
            <div className="message ai-message" style={{ pointerEvents: 'auto' }}>
              <p>{aiResponse}</p>
            </div>
          )}
        </div>

        {/* Scene - zIndex: 2 */}
        <div className="avatar-container" style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
          <Scene />
        </div>
      </div>
      <PoseControls />
      <UI />
      {isSettingsOpen && <Settings />}
      {isVisualizationSettingsOpen && <VisualizationSettings />}
    </div>
  );
}

export default App;
