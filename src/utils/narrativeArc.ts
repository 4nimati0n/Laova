// Narrative Arc Detection System
// Analyzes conversation flow to detect narrative phases and adapt visual generation

import type { VisualConcept } from '../store/useAppStore';

/**
 * Narrative phases that guide visual generation
 */
export enum NarrativePhase {
    INTRODUCTION = 'introduction',    // Beginning of conversation - establish visual world
    INSTANT = 'instant',              // NEW: Default reactive phase - high reactivity to current message
    DEVELOPMENT = 'development',      // Ongoing discussion - evolve existing elements
    CLIMAX = 'climax',                // Emotional peak - intensify visual elements
    TRANSITION = 'transition',        // Topic change - smooth visual bridge
}

/**
 * Conversation message with optional emotions
 */
interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
    emotions?: Array<{ name: string; score: number }>;
}

/**
 * Detects the current narrative phase based on conversation context
 */export class NarrativeArcDetector {
    /**
     * Detect the narrative phase from conversation analysis
     */
    detectPhase(
        currentMessage: string,
        conversationHistory: ConversationMessage[],
        emotions?: Array<{ name: string; score: number }>
    ): NarrativePhase {
        const conversationLength = conversationHistory.length;

        // INTRODUCTION: First few messages
        if (conversationLength <= 2) {
            console.log('📖 Narrative Phase: INTRODUCTION (conversation just started)');
            return NarrativePhase.INTRODUCTION;
        }

        // Analyze topic shift
        const topicShift = this.detectTopicChange(currentMessage, conversationHistory);
        if (topicShift > 0.7) {
            console.log('📖 Narrative Phase: TRANSITION (major topic shift detected)');
            return NarrativePhase.TRANSITION;
        }

        // Analyze emotional intensity
        const emotionalIntensity = this.calculateEmotionalIntensity(emotions);
        if (emotionalIntensity > 0.75) {
            console.log('📖 Narrative Phase: CLIMAX (high emotional intensity)');
            return NarrativePhase.CLIMAX;
        }

        // Check if topic is developing (same keywords for continuity)
        const isSameTopic = topicShift < 0.3;
        const emotionsStable = emotionalIntensity < 0.5;

        // DEVELOPMENT: Only if same topic AND stable emotions AND conversation established
        if (isSameTopic && emotionsStable && conversationLength > 3) {
            console.log('📖 Narrative Phase: DEVELOPMENT (same topic, stable emotions)');
            return NarrativePhase.DEVELOPMENT;
        }

        // DEFAULT: INSTANT (maximum reactivity to current message)
        console.log('📖 Narrative Phase: INSTANT (reactive to current message)');
        return NarrativePhase.INSTANT;
    }

    /**
     * Detect topic changes by comparing current message to recent history
     */
    private detectTopicChange(
        currentMessage: string,
        history: ConversationMessage[]
    ): number {
        if (history.length < 2) return 0;

        const recentMessages = history.slice(-3).map(m => m.content.toLowerCase());
        const currentLower = currentMessage.toLowerCase();

        // Extract keywords from current message
        const currentKeywords = this.extractKeywords(currentLower);

        // Extract keywords from recent messages
        const recentKeywords = recentMessages
            .flatMap(msg => this.extractKeywords(msg));

        // Calculate overlap
        const overlap = currentKeywords.filter(kw =>
            recentKeywords.includes(kw)
        ).length;

        const totalKeywords = currentKeywords.length;
        if (totalKeywords === 0) return 0;

        const similarity = overlap / totalKeywords;
        const topicShift = 1 - similarity;

        console.log('📊 Topic shift analysis:', {
            currentKeywords: currentKeywords.slice(0, 5),
            recentKeywords: recentKeywords.slice(0, 5),
            similarity: Math.round(similarity * 100) + '%',
            shift: Math.round(topicShift * 100) + '%'
        });

        return topicShift;
    }

    /**
     * Extract meaningful keywords from text
     */
    private extractKeywords(text: string): string[] {
        // Remove common words and extract nouns/adjectives
        const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those', 'and', 'or', 'but', 'if', 'then', 'so', 'about', 'with', 'from', 'for', 'to', 'of', 'in', 'on', 'at', 'by']);

        const words = text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word =>
                word.length > 3 &&
                !stopWords.has(word)
            );

        return [...new Set(words)];
    }

    /**
     * Calculate emotional intensity from emotion scores
     */
    private calculateEmotionalIntensity(
        emotions?: Array<{ name: string; score: number }>
    ): number {
        if (!emotions || emotions.length === 0) return 0;

        // High-intensity emotions
        const intensityEmotions = new Set([
            'joy', 'excitement', 'ecstasy', 'enthusiasm',
            'anger', 'fear', 'anxiety', 'distress',
            'love', 'admiration', 'awe',
            'surprise', 'shock'
        ]);

        // Calculate weighted intensity
        const intensityScore = emotions.reduce((total, emotion) => {
            const isIntense = intensityEmotions.has(emotion.name.toLowerCase());
            return total + (isIntense ? emotion.score * 1.5 : emotion.score * 0.5);
        }, 0) / emotions.length;

        return Math.min(intensityScore, 1);
    }

    /**
     * Get visual directive for the current narrative phase
     */
    getVisualDirective(phase: NarrativePhase): string {
        const directives: Record<NarrativePhase, string> = {
            [NarrativePhase.INTRODUCTION]:
                "Create a FRESH, INVITING scene that establishes the visual world. Use clear, welcoming compositions with good lighting. Set the foundation for the narrative. NO human characters.",

            [NarrativePhase.INSTANT]:
                "Create a vivid CONCEPTUAL visualization of the current message. Focus on SYMBOLS, OBJECTS, and ABSTRACT REPRESENTATIONS. Avoid human characters entirely. Maintain only the emotional palette from previous imagery. High reactivity to the current concept.",

            [NarrativePhase.DEVELOPMENT]:
                "EVOLVE the existing scene progressively. Maintain visual continuity with established mood and palette. Build upon the emotional atmosphere naturally. NO human characters.",

            [NarrativePhase.CLIMAX]:
                "INTENSIFY the visual elements dramatically! Use stronger colors, dynamic lighting, more contrast, energetic composition. Amplify emotional resonance through visual intensity. NO human characters.",

            [NarrativePhase.TRANSITION]:
                "Create a SMOOTH VISUAL BRIDGE to a new setting or theme. Maintain the established mood and palette while gradually introducing new elements. Ensure graceful transition, not abrupt change. NO human characters.",
        };

        return directives[phase];
    }

    /**
     * Adapt visual memory retrieval based on narrative phase
     */
    getContinuityStrength(phase: NarrativePhase): 'strong' | 'moderate' | 'light' {
        const strengthMap: Record<NarrativePhase, 'strong' | 'moderate' | 'light'> = {
            [NarrativePhase.INTRODUCTION]: 'light',      // Allow freedom to establish
            [NarrativePhase.INSTANT]: 'light',           // High reactivity, low continuity
            [NarrativePhase.DEVELOPMENT]: 'moderate',    // Balanced (reduced from strong)
            [NarrativePhase.CLIMAX]: 'moderate',         // Keep elements but intensify
            [NarrativePhase.TRANSITION]: 'moderate',     // Blend old and new
        };

        return strengthMap[phase];
    }

    /**
     * Get the number of visual concepts to maintain based on phase
     */
    getMemoryDepth(phase: NarrativePhase): number {
        const depthMap: Record<NarrativePhase, number> = {
            [NarrativePhase.INTRODUCTION]: 0,      // No memory yet
            [NarrativePhase.INSTANT]: 1,           // Minimal memory - high reactivity
            [NarrativePhase.DEVELOPMENT]: 2,       // Moderate memory (reduced from 4)
            [NarrativePhase.CLIMAX]: 1,            // Focus on key elements
            [NarrativePhase.TRANSITION]: 2,        // Light connection to past
        };

        return depthMap[phase];
    }
}

/**
 * Singleton instance for easy access
 */
export const narrativeDetector = new NarrativeArcDetector();
