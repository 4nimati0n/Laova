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
      <div className="main-content">
        <div className="avatar-container">
          <Scene />
        </div>

        {/* Chat Overlay */}
        <div className="chat-overlay">
          {userMessage && (
            <div className="message user-message">
              <p>{userMessage}</p>
            </div>
          )}
          {aiResponse && (
            <div className="message ai-message">
              <p>{aiResponse}</p>
            </div>
          )}
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
