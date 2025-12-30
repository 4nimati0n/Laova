/**
 * Conversation Session Management
 * Handles Hume AI Chat Group persistence for conversation continuity
 */

const CHAT_GROUP_ID_KEY = 'laura_chat_group_id';
const SESSION_TIMESTAMP_KEY = 'laura_session_timestamp';

export interface ConversationSession {
    chatGroupId: string | null;
    isPaused: boolean;
    isActive: boolean;
    lastInteractionTime: Date | null;
}

/**
 * Get the current conversation session state
 */
export const getConversationSession = (): ConversationSession => {
    const chatGroupId = localStorage.getItem(CHAT_GROUP_ID_KEY);
    const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);

    return {
        chatGroupId: chatGroupId || null,
        isPaused: false,
        isActive: false,
        lastInteractionTime: timestamp ? new Date(timestamp) : null,
    };
};

/**
 * Get or create a chat group ID for resuming conversations
 * Returns null for a fresh conversation
 */
export const getChatGroupIdForResume = (): string | null => {
    const chatGroupId = localStorage.getItem(CHAT_GROUP_ID_KEY);

    if (!chatGroupId) {
        return null;
    }

    // Check if the session is too old (e.g., > 24 hours)
    const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
    if (timestamp) {
        const lastTime = new Date(timestamp);
        const hoursSinceLastInteraction = (Date.now() - lastTime.getTime()) / (1000 * 60 * 60);

        // If session is older than 24 hours, start fresh
        if (hoursSinceLastInteraction > 24) {
            console.log('🕐 Session expired (>24h), starting fresh conversation');
            clearChatGroupId();
            return null;
        }
    }

    console.log('📚 Resuming conversation with Chat Group:', chatGroupId);
    return chatGroupId;
};

/**
 * Save the chat group ID from Hume
 */
export const saveChatGroupId = (id: string): void => {
    localStorage.setItem(CHAT_GROUP_ID_KEY, id);
    localStorage.setItem(SESSION_TIMESTAMP_KEY, new Date().toISOString());
    console.log('💾 Saved Chat Group ID:', id);
};

/**
 * Clear the chat group ID (start a fresh conversation)
 */
export const clearChatGroupId = (): void => {
    localStorage.removeItem(CHAT_GROUP_ID_KEY);
    localStorage.removeItem(SESSION_TIMESTAMP_KEY);
    console.log('🗑️ Cleared Chat Group ID - fresh conversation');
};

/**
 * Update the session timestamp (to keep session alive)
 */
export const updateSessionTimestamp = (): void => {
    localStorage.setItem(SESSION_TIMESTAMP_KEY, new Date().toISOString());
};
