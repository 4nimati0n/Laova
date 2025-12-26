import type { Emotion } from '../hooks/useEmotion';

// All audio tags that ElevenLabs v3 supports + French equivalents
// Matches: [tag] format (case insensitive)
const TAG_REGEX = /\[(laughs|laughs harder|starts laughing|wheezing|rires|rit|sourire|whispers|chuchote|sighs|soupire|exhales|expire|sarcastic|sarcastique|curious|curieux|curieuse|excited|excité|excitée|enthousiaste|crying|pleure|snorts|mischievously|malicieux|malicieuse|gunshot|applause|applaudissements|clapping|explosion|swallows|avale|gulps|sings|chante|woo|fart)\]/gi;

// Map audio tags to VRM emotions
// User corrections:
// - [excited] → happy (not surprised, surprised looks like fear)
// - [curious] → relaxed (not neutral)
// - neutral has >:< face (negative), so unknown → sad
const TAG_TO_EMOTION: Record<string, Emotion> = {
    // Laughing/Happy emotions
    'laughs': 'happy',
    'laughs harder': 'happy',
    'starts laughing': 'happy',
    'wheezing': 'happy',
    'rires': 'happy',
    'rit': 'happy',
    'sourire': 'happy',
    'woo': 'happy',
    'applause': 'happy',
    'applaudissements': 'happy',
    'clapping': 'happy',
    'excited': 'happy',
    'excité': 'happy',
    'excitée': 'happy',
    'enthousiaste': 'happy',
    'mischievously': 'happy',
    'malicieux': 'happy',
    'malicieuse': 'happy',

    // Sad emotions
    'sighs': 'sad',
    'soupire': 'sad',
    'exhales': 'sad',
    'expire': 'sad',
    'crying': 'sad',
    'pleure': 'sad',

    // Relaxed emotions
    'whispers': 'relaxed',
    'chuchote': 'relaxed',
    'curious': 'relaxed',
    'curieux': 'relaxed',
    'curieuse': 'relaxed',
    'sings': 'relaxed',
    'chante': 'relaxed',

    // Angry/Sarcastic emotions
    'sarcastic': 'angry',
    'sarcastique': 'angry',
    'snorts': 'angry',

    // Surprised emotions (for actual surprises, not excitement)
    'gunshot': 'surprised',
    'explosion': 'surprised',

    // Neutral actions (no strong emotion)
    'swallows': 'neutral',
    'avale': 'neutral',
    'gulps': 'neutral',
    'fart': 'neutral',
};

/**
 * Extract all audio tags from text
 */
export const extractTags = (text: string): { firstTag: string | null; lastTag: string | null; allTags: string[] } => {
    const matches = text.match(TAG_REGEX) || [];
    const cleanedTags = matches.map(t => t.toLowerCase().replace(/[\[\]]/g, ''));

    return {
        firstTag: cleanedTags.length > 0 ? cleanedTags[0] : null,
        lastTag: cleanedTags.length > 0 ? cleanedTags[cleanedTags.length - 1] : null,
        allTags: cleanedTags
    };
};

/**
 * Convert an audio tag to a VRM emotion
 * Unknown tags return neutral (no emotion change)
 */
export const tagToEmotion = (tag: string | null): Emotion => {
    if (!tag) return 'neutral'; // No tag = neutral default
    const lowerTag = tag.toLowerCase();
    return TAG_TO_EMOTION[lowerTag] || 'neutral'; // Unknown tag = neutral (no change)
};

/**
 * Remove all audio tags from text for display
 */
export const stripTags = (text: string): string => {
    return text
        .replace(TAG_REGEX, '')
        .replace(/\s{2,}/g, ' ') // Clean up double spaces
        .trim();
};

/**
 * Get emotion intensities for each emotion type
 */
export const getEmotionIntensity = (emotion: Emotion): number => {
    const intensities: Record<Emotion, number> = {
        neutral: 1.0,
        happy: 1.0,
        angry: 2.0,
        sad: 2.0,
        relaxed: 2.0,
        surprised: 2.5,
        extra: 1.0,
        blink: 1.0,
        fun: 1.0,
        joy: 1.0,
        sorrow: 2.0,
    };
    return intensities[emotion];
};
