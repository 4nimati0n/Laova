/**
 * Hume AI Emotion → VRM Expression Mapping
 * 
 * Maps 48 Hume emotions to weighted combinations of VRM expressions.
 * VRM standard expressions: happy, angry, sad, surprised, fun, neutral, blink
 */

// VRM Expression names (standard + common variants)
export type VrmExpression =
    | 'happy' | 'joy'
    | 'angry'
    | 'sad' | 'sorrow'
    | 'surprised'
    | 'fun'
    | 'neutral'
    | 'blink';

// Weighted mapping for each Hume emotion
export interface VrmExpressionWeights {
    happy?: number;
    angry?: number;
    sad?: number;
    surprised?: number;
    fun?: number;
    neutral?: number;
}

// Complete mapping of Hume 48 emotions to VRM expression weights
export const HUME_TO_VRM_MAPPING: Record<string, VrmExpressionWeights> = {
    // === POSITIVE EMOTIONS ===
    "Joy": { happy: 1.0 },
    "Amusement": { happy: 0.7, fun: 0.5 },
    "Contentment": { happy: 0.4, neutral: 0.6 },
    "Love": { happy: 0.6, fun: 0.2 },
    "Admiration": { happy: 0.5, surprised: 0.2 },
    "Adoration": { happy: 0.7, fun: 0.3 },
    "Interest": { surprised: 0.3, neutral: 0.7 },
    "Excitement": { happy: 0.8, surprised: 0.4 },
    "Ecstasy": { happy: 1.0, fun: 0.5 },
    "Elation": { happy: 0.9, fun: 0.3 },
    "Pride": { happy: 0.5, neutral: 0.5 },
    "Triumph": { happy: 0.7 },
    "Relief": { happy: 0.4, neutral: 0.6 },
    "Satisfaction": { happy: 0.5, neutral: 0.5 },
    "Desire": { happy: 0.3, surprised: 0.2 },
    "Romance": { happy: 0.5, fun: 0.3 },
    "Nostalgia": { sad: 0.3, happy: 0.3 },
    "Entrancement": { surprised: 0.4, happy: 0.3 },
    "Aesthetic Appreciation": { happy: 0.4, surprised: 0.2 },
    "Calmness": { neutral: 0.9 },
    "Serenity": { neutral: 0.8, happy: 0.2 },

    // === NEGATIVE EMOTIONS ===
    "Anger": { angry: 1.0 },
    "Annoyance": { angry: 0.5 },
    "Contempt": { angry: 0.6 },
    "Disgust": { angry: 0.5, sad: 0.3 },
    "Sadness": { sad: 1.0 },
    "Disappointment": { sad: 0.7 },
    "Distress": { sad: 0.8, surprised: 0.2 },
    "Grief": { sad: 1.0 },
    "Guilt": { sad: 0.6 },
    "Shame": { sad: 0.5, angry: 0.2 },
    "Embarrassment": { sad: 0.4, surprised: 0.3 },
    "Regret": { sad: 0.6 },
    "Envy": { angry: 0.4, sad: 0.3 },
    "Jealousy": { angry: 0.5, sad: 0.2 },
    "Horror": { surprised: 0.8, sad: 0.5 },
    "Pain": { sad: 0.6, angry: 0.3 },
    "Sympathy": { sad: 0.5, happy: 0.1 },
    "Empathic Pain": { sad: 0.6 },
    "Tiredness": { sad: 0.3, neutral: 0.7 },

    // === SURPRISE / ALERTNESS ===
    "Surprise (positive)": { surprised: 1.0, happy: 0.3 },
    "Surprise (negative)": { surprised: 1.0, angry: 0.2 },
    "Fear": { surprised: 0.7, sad: 0.4 },
    "Anxiety": { sad: 0.4, surprised: 0.3 },
    "Awe": { surprised: 0.6, happy: 0.3 },
    "Awkwardness": { surprised: 0.3, sad: 0.3 },
    "Realization": { surprised: 0.5 },

    // === COGNITIVE / NEUTRAL ===
    "Concentration": { neutral: 0.9 },
    "Contemplation": { neutral: 0.8 },
    "Confusion": { surprised: 0.4, sad: 0.2 },
    "Doubt": { sad: 0.3, neutral: 0.6 },
    "Boredom": { sad: 0.2, neutral: 0.8 },
    "Craving": { happy: 0.2, surprised: 0.2 },
    "Determination": { angry: 0.2, neutral: 0.7 },
    "Seriousness": { neutral: 0.9 },
};

// Normalize emotion name for case-insensitive matching
function normalizeEmotionName(name: string): string {
    return name.toLowerCase().trim();
}

// Create a case-insensitive lookup map
const NORMALIZED_MAPPING: Record<string, VrmExpressionWeights> = {};
Object.entries(HUME_TO_VRM_MAPPING).forEach(([key, value]) => {
    NORMALIZED_MAPPING[normalizeEmotionName(key)] = value;
});

/**
 * Get VRM expression weights for a Hume emotion
 */
export function getVrmWeightsForHumeEmotion(emotionName: string): VrmExpressionWeights {
    const normalized = normalizeEmotionName(emotionName);
    return NORMALIZED_MAPPING[normalized] || { neutral: 0.5 };
}

/**
 * Blend all Hume emotions into final VRM expression values
 * 
 * @param humeEmotions - Array of { name: string, score: number } from Hume API
 * @returns Object with final VRM expression values (0-1)
 */
export function blendHumeEmotionsToVrm(
    humeEmotions: Array<{ name: string; score: number }>
): Record<string, number> {
    const result: Record<string, number> = {
        happy: 0,
        angry: 0,
        sad: 0,
        surprised: 0,
        fun: 0,
        neutral: 0,
    };

    // Sum weighted contributions from all emotions
    for (const emotion of humeEmotions) {
        const weights = getVrmWeightsForHumeEmotion(emotion.name);

        for (const [expr, weight] of Object.entries(weights)) {
            if (weight && result[expr] !== undefined) {
                result[expr] += emotion.score * weight;
            }
        }
    }

    // Clamp all values to [0, 1]
    for (const key of Object.keys(result)) {
        result[key] = Math.min(1, Math.max(0, result[key]));
    }

    // Normalize if total exceeds reasonable threshold (avoid overexpression)
    const total = Object.values(result).reduce((sum, v) => sum + v, 0);
    if (total > 1.5) {
        const scale = 1.5 / total;
        for (const key of Object.keys(result)) {
            result[key] *= scale;
        }
    }

    return result;
}

/**
 * Get the dominant emotion name from blended VRM expressions
 */
export function getDominantEmotion(vrmExpressions: Record<string, number>): string {
    let maxKey = 'neutral';
    let maxValue = 0;

    for (const [key, value] of Object.entries(vrmExpressions)) {
        if (value > maxValue) {
            maxValue = value;
            maxKey = key;
        }
    }

    return maxKey;
}

// === TUNED BLENDING ===
import type { EmotionTuningParams } from './emotionTuning';
import {
    DEFAULT_TUNING,
    applyRankDecay,
    applyContrast,
    applyIntensityBoost
} from './emotionTuning';

/**
 * Blend Hume emotions to VRM expressions with tuning parameters
 * 
 * @param humeEmotions - Array of { name: string, score: number } from Hume API (should be sorted by score desc)
 * @param params - Tuning parameters (optional, uses defaults if not provided)
 * @returns Object with final VRM expression values (0-1)
 */
export function blendHumeEmotionsToVrmTuned(
    humeEmotions: Array<{ name: string; score: number }>,
    params: EmotionTuningParams = DEFAULT_TUNING
): Record<string, number> {
    const result: Record<string, number> = {
        happy: 0,
        angry: 0,
        sad: 0,
        surprised: 0,
        fun: 0,
        neutral: 0,
    };

    // Ensure emotions are sorted by score (descending)
    const sortedEmotions = [...humeEmotions].sort((a, b) => b.score - a.score);

    // Apply rank-based decay weighting
    const weightedEmotions = applyRankDecay(sortedEmotions, params);

    // Sum weighted contributions
    for (const emotion of weightedEmotions) {
        const vrmWeights = getVrmWeightsForHumeEmotion(emotion.name);

        for (const [expr, weight] of Object.entries(vrmWeights)) {
            if (weight && result[expr] !== undefined) {
                result[expr] += emotion.weight * weight;
            }
        }
    }

    // Apply contrast enhancement
    let enhanced = applyContrast(result, params.contrastPower);

    // Apply intensity boost
    enhanced = applyIntensityBoost(enhanced, params.intensityBoost);

    // Ensure neutral has a baseline if no strong emotions
    const totalExpression = Object.values(enhanced).reduce((sum, v) => sum + v, 0);
    if (totalExpression < 0.1) {
        enhanced.neutral = 0.3;
    }

    return enhanced;
}
