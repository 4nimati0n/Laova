/**
 * Compassion Mapping System
 * 
 * Based on psychological research on co-regulation and antidote emotions.
 * Transforms user emotions into healing, compassionate responses.
 */

// No imports needed - self-contained module

/**
 * Response mode for emotional processing
 */
export type ResponseMode = 'empathy' | 'compassion' | 'balanced';

/**
 * Extended tuning parameters with compassion settings
 */
export interface CompassionParams {
    /** Response mode */
    responseMode: ResponseMode;

    /** How strongly to apply antidote emotions (0-1) */
    compassionStrength: number;

    /** Baseline calm/grounded presence (0-1) */
    baselineCalm: number;

    /** Boost empathy for positive emotions (0-1) */
    positiveEmpathyBias: number;
}

/**
 * Default compassion parameters
 */
export const DEFAULT_COMPASSION: CompassionParams = {
    responseMode: 'balanced',
    compassionStrength: 0.6,
    baselineCalm: 0.2,
    positiveEmpathyBias: 0.8,
};

/**
 * Slider config for compassion parameters
 */
export const COMPASSION_SLIDER_CONFIG = {
    compassionStrength: {
        min: 0,
        max: 1,
        step: 0.05,
        label: 'Force compassion',
        description: 'Intensité des émotions antidotes',
    },
    baselineCalm: {
        min: 0,
        max: 0.5,
        step: 0.05,
        label: 'Présence ancrée',
        description: 'Calme de base constant',
    },
    positiveEmpathyBias: {
        min: 0,
        max: 1,
        step: 0.05,
        label: 'Partage positif',
        description: 'Miroir plus fort pour la joie',
    },
} as const;

/**
 * Mapping of negative emotions to their antidote/healing responses
 * Based on therapeutic research on emotion transformation
 */
export const ANTIDOTE_MAPPING: Record<string, AntidoteResponse> = {
    // === FEAR/ANXIETY → Calm, Grounded Presence ===
    fear: { antidote: { neutral: 0.5, happy: 0.2 }, empathyWeight: 0.2 },
    anxiety: { antidote: { neutral: 0.6, happy: 0.1 }, empathyWeight: 0.3 },
    horror: { antidote: { neutral: 0.7 }, empathyWeight: 0.1 },
    distress: { antidote: { neutral: 0.5, happy: 0.2 }, empathyWeight: 0.3 },

    // === ANGER → Patience, Soft Presence ===
    anger: { antidote: { neutral: 0.6, happy: 0.1 }, empathyWeight: 0.2 },
    annoyance: { antidote: { neutral: 0.5, happy: 0.2 }, empathyWeight: 0.4 },
    contempt: { antidote: { neutral: 0.5, happy: 0.2 }, empathyWeight: 0.3 },
    disgust: { antidote: { neutral: 0.5 }, empathyWeight: 0.3 },

    // === SADNESS → Warmth + Gentle Mirroring ===
    sadness: { antidote: { happy: 0.3, neutral: 0.3 }, empathyWeight: 0.5 },
    grief: { antidote: { sad: 0.3, neutral: 0.3 }, empathyWeight: 0.6 },
    disappointment: { antidote: { happy: 0.3, neutral: 0.4 }, empathyWeight: 0.4 },
    pain: { antidote: { neutral: 0.4, happy: 0.2 }, empathyWeight: 0.5 },
    'empathic pain': { antidote: { neutral: 0.4, happy: 0.2 }, empathyWeight: 0.5 },
    sympathy: { antidote: { neutral: 0.3, happy: 0.3 }, empathyWeight: 0.6 },

    // === SHAME/GUILT → Acceptance, Neutrality ===
    shame: { antidote: { neutral: 0.6, happy: 0.2 }, empathyWeight: 0.2 },
    guilt: { antidote: { neutral: 0.5, happy: 0.3 }, empathyWeight: 0.3 },
    embarrassment: { antidote: { neutral: 0.4, happy: 0.3 }, empathyWeight: 0.4 },
    awkwardness: { antidote: { happy: 0.4, neutral: 0.3 }, empathyWeight: 0.4 },

    // === CONFUSION/DOUBT → Calm Clarity ===
    confusion: { antidote: { neutral: 0.6, happy: 0.2 }, empathyWeight: 0.3 },
    doubt: { antidote: { neutral: 0.5, happy: 0.3 }, empathyWeight: 0.4 },

    // === POSITIVE EMOTIONS → Mirror with joy ===
    joy: { antidote: { happy: 0.9, fun: 0.3 }, empathyWeight: 0.9 },
    amusement: { antidote: { happy: 0.8, fun: 0.4 }, empathyWeight: 0.9 },
    contentment: { antidote: { happy: 0.6, neutral: 0.3 }, empathyWeight: 0.8 },
    love: { antidote: { happy: 0.7, fun: 0.2 }, empathyWeight: 0.9 },
    admiration: { antidote: { happy: 0.6, surprised: 0.2 }, empathyWeight: 0.8 },
    excitement: { antidote: { happy: 0.8, surprised: 0.3 }, empathyWeight: 0.9 },
    ecstasy: { antidote: { happy: 1.0, fun: 0.4 }, empathyWeight: 0.9 },
    pride: { antidote: { happy: 0.6, neutral: 0.3 }, empathyWeight: 0.7 },
    relief: { antidote: { happy: 0.5, neutral: 0.4 }, empathyWeight: 0.7 },
    satisfaction: { antidote: { happy: 0.6, neutral: 0.3 }, empathyWeight: 0.8 },

    // === NEUTRAL/COGNITIVE → Gentle presence ===
    concentration: { antidote: { neutral: 0.7, happy: 0.2 }, empathyWeight: 0.5 },
    contemplation: { antidote: { neutral: 0.6, happy: 0.2 }, empathyWeight: 0.5 },
    calmness: { antidote: { neutral: 0.7, happy: 0.2 }, empathyWeight: 0.8 },
    serenity: { antidote: { neutral: 0.6, happy: 0.3 }, empathyWeight: 0.8 },
    interest: { antidote: { surprised: 0.3, happy: 0.3, neutral: 0.3 }, empathyWeight: 0.7 },
    determination: { antidote: { neutral: 0.5, happy: 0.3 }, empathyWeight: 0.6 },
};

interface AntidoteResponse {
    /** VRM expression weights for the antidote response */
    antidote: Record<string, number>;
    /** How much to still mirror the original emotion (0-1) */
    empathyWeight: number;
}

/**
 * VRM expression type for output
 */
interface VrmExpressions {
    happy: number;
    angry: number;
    sad: number;
    surprised: number;
    fun: number;
    neutral: number;
}

/**
 * Compute compassionate response from raw VRM expressions
 * 
 * @param rawVrm - Raw VRM expressions from empathy mapping
 * @param dominantEmotions - Top emotions from Hume (for antidote lookup)
 * @param compassionParams - Compassion tuning parameters
 * @returns Blended VRM expressions with compassionate response
 */
export function computeCompassionateResponse(
    rawVrm: Record<string, number>,
    dominantEmotions: Array<{ name: string; score: number }>,
    compassionParams: CompassionParams
): VrmExpressions {
    const { responseMode, compassionStrength, baselineCalm, positiveEmpathyBias } = compassionParams;

    // Initialize result with baseline calm presence
    const result: VrmExpressions = {
        happy: baselineCalm * 0.3,
        angry: 0,
        sad: 0,
        surprised: 0,
        fun: 0,
        neutral: baselineCalm,
    };

    // Pure empathy mode - just return raw with baseline
    if (responseMode === 'empathy') {
        return blendWithBaseline(rawVrm, baselineCalm);
    }

    // Get antidote response based on dominant emotions
    const antidoteVrm = computeAntidoteFromEmotions(dominantEmotions);

    // Pure compassion mode - mostly antidote
    if (responseMode === 'compassion') {
        return blendWithBaseline(antidoteVrm, baselineCalm);
    }

    // Balanced mode - blend based on emotion type
    // Positive emotions get more empathy, negative get more antidote
    const isPositiveDominant = checkPositiveDominant(dominantEmotions);

    let empathyRatio: number;
    if (isPositiveDominant) {
        // For positive emotions, favor empathy (share the joy)
        empathyRatio = 0.5 + (positiveEmpathyBias * 0.5);
    } else {
        // For negative emotions, favor compassion (provide antidote)
        empathyRatio = 1 - compassionStrength;
    }

    // Blend empathy and compassion
    for (const key of Object.keys(result) as Array<keyof VrmExpressions>) {
        const empathyValue = rawVrm[key] ?? 0;
        const compassionValue = antidoteVrm[key] ?? 0;

        result[key] = (empathyValue * empathyRatio) + (compassionValue * (1 - empathyRatio));
    }

    // Add baseline calm
    result.neutral = Math.min(1, result.neutral + baselineCalm);

    // Clamp all values
    for (const key of Object.keys(result) as Array<keyof VrmExpressions>) {
        result[key] = Math.max(0, Math.min(1, result[key]));
    }

    return result;
}

/**
 * Compute antidote VRM expressions from dominant Hume emotions
 */
function computeAntidoteFromEmotions(
    emotions: Array<{ name: string; score: number }>
): Record<string, number> {
    const result: Record<string, number> = {
        happy: 0, angry: 0, sad: 0, surprised: 0, fun: 0, neutral: 0,
    };

    // Take top 3 emotions for antidote computation
    const topEmotions = emotions.slice(0, 3);
    let totalWeight = 0;

    for (const emotion of topEmotions) {
        const normalized = emotion.name.toLowerCase();
        const mapping = ANTIDOTE_MAPPING[normalized];

        if (mapping) {
            const weight = emotion.score;
            totalWeight += weight;

            for (const [expr, value] of Object.entries(mapping.antidote)) {
                result[expr] = (result[expr] ?? 0) + value * weight;
            }
        }
    }

    // Normalize by total weight
    if (totalWeight > 0) {
        for (const key of Object.keys(result)) {
            result[key] /= totalWeight;
        }
    } else {
        // Default to calm neutral if no mapping found
        result.neutral = 0.5;
        result.happy = 0.2;
    }

    return result;
}

/**
 * Blend VRM expressions with baseline calm
 */
function blendWithBaseline(
    vrm: Record<string, number>,
    baselineCalm: number
): VrmExpressions {
    return {
        happy: Math.max(0, Math.min(1, (vrm.happy ?? 0) + baselineCalm * 0.2)),
        angry: Math.max(0, Math.min(1, vrm.angry ?? 0)),
        sad: Math.max(0, Math.min(1, vrm.sad ?? 0)),
        surprised: Math.max(0, Math.min(1, vrm.surprised ?? 0)),
        fun: Math.max(0, Math.min(1, vrm.fun ?? 0)),
        neutral: Math.max(0, Math.min(1, (vrm.neutral ?? 0) + baselineCalm)),
    };
}

/**
 * Check if dominant emotions are positive
 */
function checkPositiveDominant(emotions: Array<{ name: string; score: number }>): boolean {
    const positiveEmotions = [
        'joy', 'amusement', 'contentment', 'love', 'admiration', 'excitement',
        'ecstasy', 'elation', 'pride', 'relief', 'satisfaction', 'triumph',
        'interest', 'calmness', 'serenity', 'romance', 'desire'
    ];

    if (emotions.length === 0) return false;

    const topEmotion = emotions[0].name.toLowerCase();
    return positiveEmotions.includes(topEmotion);
}
