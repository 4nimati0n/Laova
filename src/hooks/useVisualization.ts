// useVisualization hook
// Handles triggering visualization generation based on conversation events

import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getVisualizationPrompt, getMoodFromEmotions } from '../utils/visualizationPrompt';
import { generateVisualization } from '../utils/falai';

export const useVisualization = () => {
    const {
        visualizationEnabled,
        falApiKey,
        setCurrentVisualization,
        setIsGeneratingVisualization
    } = useAppStore();

    /**
     * Trigger visualization generation for given text
     * @param text The text to visualize (user message or Laura's response)
     * @param emotions Optional emotion data to enhance the visualization
     */
    const triggerVisualization = useCallback(async (
        text: string,
        emotions?: Array<{ name: string; score: number }>
    ) => {
        // Skip if visualization is disabled or no API key
        if (!visualizationEnabled || !falApiKey) {
            console.log('🎨 Visualization skipped: disabled or no API key');
            return;
        }

        // Don't visualize very short text
        if (text.trim().length < 5) {
            console.log('🎨 Visualization skipped: text too short');
            return;
        }

        try {
            setIsGeneratingVisualization(true);

            // Get visual prompt from Mistral
            let visualPrompt = await getVisualizationPrompt(text);

            // Enhance with emotional context if available
            if (emotions && emotions.length > 0) {
                const moodEnhancement = getMoodFromEmotions(emotions);
                visualPrompt += `, ${moodEnhancement}`;
            }

            console.log('🎨 Generating visualization for:', visualPrompt);

            // Generate image
            const imageUrl = await generateVisualization(visualPrompt);

            // Update state with new visualization
            setCurrentVisualization(imageUrl);

        } catch (error: any) {
            console.error('🎨 Visualization generation failed:', error);
            // Don't set error - visualization is optional, shouldn't block conversation
        } finally {
            setIsGeneratingVisualization(false);
        }
    }, [visualizationEnabled, falApiKey, setCurrentVisualization, setIsGeneratingVisualization]);

    /**
     * Clear the current visualization
     */
    const clearVisualization = useCallback(() => {
        setCurrentVisualization(null);
    }, [setCurrentVisualization]);

    return {
        triggerVisualization,
        clearVisualization
    };
};
