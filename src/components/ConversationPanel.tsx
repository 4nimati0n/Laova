import { useAppStore } from '../store/useAppStore';
import { useEffect, useRef } from 'react';
import '../styles/ConversationPanel.css';

// Helper to format emotion name (camelCase to readable)
const formatEmotionName = (name: string): string => {
    return name.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
};

export const ConversationPanel = () => {
    const { conversationHistory, clearConversationHistory, showUserEmotions } = useAppStore();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [conversationHistory]);

    return (
        <div className="conversation-panel">
            <div className="conversation-header">
                <h2>Conversation</h2>
                {conversationHistory.length > 0 && (
                    <button
                        className="clear-button"
                        onClick={clearConversationHistory}
                        title="Effacer la conversation"
                    >
                        🗑️
                    </button>
                )}
            </div>
            <div className="conversation-content" ref={scrollContainerRef}>
                {conversationHistory.length === 0 ? (
                    <div className="empty-state">
                        <p>Start talking to begin the conversation!</p>
                    </div>
                ) : (
                    conversationHistory.map((msg, index) => (
                        <div
                            key={index}
                            className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}
                        >
                            <div className="message-label">
                                {msg.role === 'user' ? 'You' : 'Laura'}
                            </div>
                            <div className="message-content">{msg.content}</div>
                            {showUserEmotions && msg.role === 'user' && msg.emotions && msg.emotions.length > 0 && (
                                <div className="emotion-badges">
                                    {msg.emotions.map((emotion, i) => (
                                        <span key={i} className="emotion-badge">
                                            {formatEmotionName(emotion.name)}: {(emotion.score * 100).toFixed(0)}%
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
