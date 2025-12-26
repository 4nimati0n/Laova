/**
 * Emotion Tuning System
 * 
 * Provides configurable parameters for mapping Hume emotions to VRM expressions.
 * Based on psychological and ML principles for better emotion representation.
 */

/**
 * Parameters for tuning the emotion mapping algorithm
 */
export interface EmotionTuningParams {
    /** Number of top emotions to consider (1-48) */
    topK: number;

    /** Decay exponent for rank-based weighting (0 = equal, 2 = steep decay) */
    decayAlpha: number;

    /** Minimum probability threshold (0-1, emotions below this are ignored) */
    threshold: number;

    /** Intensity boost multiplier (1-3, amplifies final expressions) */
    intensityBoost: number;

    /** Contrast power (1-3, enhances differences between expressions) */
    contrastPower: number;

    /** Inertia rise rate - how fast emotions build up (0.5-5, higher = faster) */
    inertiaRise: number;

    /** Inertia fall rate - how fast emotions decay (0.2-3, lower = more persistent) */
    inertiaFall: number;

    /** Ease power for transitions (0 = linear, 1 = full ease-in-out) */
    easePower: number;

    /** Momentum for direction changes (0 = instant, 1 = smooth deceleration) */
    momentum: number;
}

/**
 * Default tuning parameters - balanced starting point
 */
export const DEFAULT_TUNING: EmotionTuningParams = {
    topK: 5,
    decayAlpha: 0.7,
    threshold: 0.10,
    intensityBoost: 1.5,
    contrastPower: 1.2,
    inertiaRise: 2.5,
    inertiaFall: 0.8,
    easePower: 0.5,    // Moderate ease-in-out
    momentum: 0.3,     // Subtle momentum for smoothness
};

/**
 * Slider configuration for UI
 */
export const TUNING_SLIDER_CONFIG = {
    topK: {
        min: 1,
        max: 48,
        step: 1,
        label: 'Émotions considérées',
        description: 'Nombre d\'émotions à prendre en compte',
    },
    decayAlpha: {
        min: 0,
        max: 2,
        step: 0.1,
        label: 'Courbe de décroissance',
        description: '0 = égal pour tous, 2 = première domine',
    },
    threshold: {
        min: 0,
        max: 0.5,
        step: 0.01,
        label: 'Seuil minimum',
        description: 'Ignorer les émotions sous ce %',
    },
    intensityBoost: {
        min: 1,
        max: 3,
        step: 0.1,
        label: 'Amplification',
        description: 'Intensifier les expressions',
    },
    contrastPower: {
        min: 1,
        max: 3,
        step: 0.1,
        label: 'Contraste',
        description: 'Renforcer les différences',
    },
    inertiaRise: {
        min: 0.5,
        max: 5,
        step: 0.1,
        label: 'Réactivité',
        description: 'Vitesse de montée des émotions',
    },
    inertiaFall: {
        min: 0.2,
        max: 3,
        step: 0.1,
        label: 'Persistance',
        description: 'Lenteur de descente',
    },
    easePower: {
        min: 0,
        max: 1,
        step: 0.05,
        label: 'Courbe fluide',
        description: '0 = linéaire, 1 = ease-in-out',
    },
    momentum: {
        min: 0,
        max: 1,
        step: 0.05,
        label: 'Élan',
        description: '0 = instantané, 1 = transitions douces',
    },
} as const;

/**
 * Apply rank-based decay to emotion weights
 * Uses power-law decay: weight = score * (1 / (rank + 1)^alpha)
 * 
 * @param emotions - Sorted array of emotions (highest score first)
 * @param params - Tuning parameters
 * @returns Weighted emotions with decay applied
 */
export function applyRankDecay(
    emotions: Array<{ name: string; score: number }>,
    params: EmotionTuningParams
): Array<{ name: string; score: number; weight: number }> {
    const { topK, decayAlpha, threshold } = params;

    // Filter by threshold first
    const filtered = emotions.filter(e => e.score >= threshold);

    // Take only top K
    const topEmotions = filtered.slice(0, topK);

    // Apply rank-based decay
    return topEmotions.map((emotion, rank) => {
        // Power-law decay: 1/(rank+1)^alpha
        // rank+1 to avoid division by zero for first element
        const decayFactor = Math.pow(1 / (rank + 1), decayAlpha);
        const weight = emotion.score * decayFactor;

        return {
            name: emotion.name,
            score: emotion.score,
            weight,
        };
    });
}

/**
 * Apply contrast enhancement to expression values
 * Uses power function to enhance differences
 * 
 * @param expressions - Object with expression values (0-1)
 * @param contrastPower - Power exponent (1 = no change, >1 = more contrast)
 * @returns Enhanced expressions
 */
export function applyContrast(
    expressions: Record<string, number>,
    contrastPower: number
): Record<string, number> {
    const result: Record<string, number> = {};

    // Find max value for relative scaling
    const values = Object.values(expressions);
    const maxValue = Math.max(...values, 0.001); // Avoid division by zero

    for (const [key, value] of Object.entries(expressions)) {
        // Normalize to 0-1 relative to max, apply power, scale back
        const normalized = value / maxValue;
        const contrasted = Math.pow(normalized, contrastPower);
        result[key] = contrasted * maxValue;
    }

    return result;
}

/**
 * Apply intensity boost to expression values
 * Multiplies all values and clamps to 0-1
 * 
 * @param expressions - Object with expression values
 * @param boost - Multiplier (1 = no change, >1 = stronger)
 * @returns Boosted expressions (clamped to 0-1)
 */
export function applyIntensityBoost(
    expressions: Record<string, number>,
    boost: number
): Record<string, number> {
    const result: Record<string, number> = {};

    for (const [key, value] of Object.entries(expressions)) {
        result[key] = Math.min(1, value * boost);
    }

    return result;
}
