// Cost Tracker for Laura's Energy System
// Calculates energy consumption based on API usage

// Pricing constants (as of Dec 2025)
const PRICING = {
    // Mistral AI - mistral-small-latest
    mistral: {
        inputPerMillion: 0.10,   // $0.10 per 1M input tokens
        outputPerMillion: 0.30,  // $0.30 per 1M output tokens
    },
    // ElevenLabs - eleven_v3 (Scale plan pricing)
    elevenlabs: {
        perCharacter: 0.00008,   // ~$0.08 per 1K characters
    },
    // Fal.ai - Flux.1 Schnell
    fal: {
        perMegapixel: 0.003,     // $0.003 per megapixel
    },
    // Hume AI - Expression Measurement
    hume: {
        perMinute: 0.0213,       // $0.0213 per minute
    },
};

// Configurable margin multiplier
// Can be adjusted for testing different profit margins
// 2.0 = 100% markup, 2.5 = 150% markup, 3.0 = 200% markup
export const MARGIN_MULTIPLIER = 2.5;

// Energy conversion rate: 1000 energy ≈ 1 hour of conversation
// At ~$0.015/message and ~60 messages/hour = ~$0.90/hour real cost
// With 2.5x margin = ~$2.25/hour = ~2.25 energy units/message for 1000/hour
const ENERGY_RATE = 1000; // energy per hour equivalent cost

export interface CostMetrics {
    mistralInputTokens: number;
    mistralOutputTokens: number;
    elevenLabsCharacters: number;
    falMegapixels: number;
    humeMinutes: number;
}

export interface CostBreakdown {
    mistral: number;
    elevenlabs: number;
    fal: number;
    hume: number;
    total: number;
    energyConsumed: number;
}

/**
 * Calculate the raw cost in USD for given metrics
 */
export const calculateRawCost = (metrics: Partial<CostMetrics>): CostBreakdown => {
    const mistralCost =
        ((metrics.mistralInputTokens || 0) / 1_000_000) * PRICING.mistral.inputPerMillion +
        ((metrics.mistralOutputTokens || 0) / 1_000_000) * PRICING.mistral.outputPerMillion;

    const elevenLabsCost = (metrics.elevenLabsCharacters || 0) * PRICING.elevenlabs.perCharacter;

    const falCost = (metrics.falMegapixels || 0) * PRICING.fal.perMegapixel;

    const humeCost = (metrics.humeMinutes || 0) * PRICING.hume.perMinute;

    const total = mistralCost + elevenLabsCost + falCost + humeCost;

    // Convert to energy units
    // Base rate: $1 = 1000 energy at cost (before margin)
    // With margin: $1 revenue = 1000 energy consumed
    const energyConsumed = Math.ceil(total * MARGIN_MULTIPLIER * ENERGY_RATE);

    return {
        mistral: mistralCost,
        elevenlabs: elevenLabsCost,
        fal: falCost,
        hume: humeCost,
        total,
        energyConsumed,
    };
};

/**
 * Estimate energy cost for a typical message exchange
 */
export const estimateMessageEnergy = (hasVisualization: 'none' | 'above_head' | 'fullscreen' = 'none', hasHume = false): number => {
    // Average metrics per message
    const metrics: CostMetrics = {
        mistralInputTokens: 500,   // system + history + user message
        mistralOutputTokens: 200,  // Laura's response
        elevenLabsCharacters: 200, // Average response length
        falMegapixels: hasVisualization === 'fullscreen' ? 2 : hasVisualization === 'above_head' ? 0.26 : 0,
        humeMinutes: hasHume ? 0.5 : 0, // ~30 seconds of analysis
    };

    return calculateRawCost(metrics).energyConsumed;
};

/**
 * Get energy level status
 */
export type EnergyStatus = 'full' | 'good' | 'hungry' | 'very_hungry' | 'exhausted' | 'empty';

export const getEnergyStatus = (current: number, max: number): EnergyStatus => {
    const percentage = (current / max) * 100;

    if (percentage >= 80) return 'full';
    if (percentage >= 40) return 'good';
    if (percentage >= 20) return 'hungry';
    if (percentage >= 5) return 'very_hungry';
    if (percentage > 0) return 'exhausted';
    return 'empty';
};

/**
 * Get estimated time remaining in minutes
 */
export const getEstimatedTimeRemaining = (energy: number): number => {
    // Average energy per minute (assuming ~1 message/min, standard interaction)
    const avgEnergyPerMinute = estimateMessageEnergy('none', false);
    return Math.floor(energy / avgEnergyPerMinute);
};

/**
 * Format time remaining for display
 */
export const formatTimeRemaining = (minutes: number): string => {
    if (minutes < 1) return "< 1 min";
    if (minutes < 60) return `~${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `~${hours}h`;
    return `~${hours}h${mins}min`;
};

// Food items available in the store
export interface FoodItem {
    id: string;
    name: string;
    nameJa: string;
    emoji: string;
    energy: number;
    price: number; // USD
    description: string;
}

export const FOOD_ITEMS: FoodItem[] = [
    {
        id: 'onigiri',
        name: 'Onigiri',
        nameJa: 'おにぎり',
        emoji: '🍙',
        energy: 100,
        price: 0.99,
        description: 'A simple rice ball snack',
    },
    {
        id: 'mochi',
        name: 'Mochi',
        nameJa: 'もち',
        emoji: '🍡',
        energy: 250,
        price: 1.99,
        description: 'Sweet and chewy treat',
    },
    {
        id: 'bento',
        name: 'Bento',
        nameJa: '弁当',
        emoji: '🍱',
        energy: 600,
        price: 4.99,
        description: 'A complete balanced meal',
    },
    {
        id: 'ramen',
        name: 'Ramen Deluxe',
        nameJa: 'ラーメン',
        emoji: '🍜',
        energy: 1500,
        price: 9.99,
        description: 'Hearty and filling bowl',
    },
    {
        id: 'feast',
        name: 'Festin Impérial',
        nameJa: '皇帝の宴',
        emoji: '👑',
        energy: 5000,
        price: 29.99,
        description: 'A royal banquet fit for Laura',
    },
];

// Subscription plans
export interface SubscriptionPlan {
    id: string;
    name: string;
    energyPerMonth: number | 'unlimited';
    pricePerMonth: number;
    description: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
        id: 'light',
        name: 'Light',
        energyPerMonth: 1500,
        pricePerMonth: 4.99,
        description: '~1h/jour de conversation',
    },
    {
        id: 'standard',
        name: 'Standard',
        energyPerMonth: 4500,
        pricePerMonth: 9.99,
        description: '~3h/jour de conversation',
    },
    {
        id: 'unlimited',
        name: 'Unlimited',
        energyPerMonth: 'unlimited',
        pricePerMonth: 19.99,
        description: 'Interactions illimitées',
    },
];
