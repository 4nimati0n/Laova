// No imports needed - self-contained module

/**
 * Resonance System - The "Scribe"
 * 
 * Implements the "Syntropie" architecture:
 * 1. Input Analysis: Detects Entropy (Disorder) and Energy (Vibration)
 * 2. Response Tuning: Adjusts the "Temperature" and "Structure" of the AI's response
 * 3. Fibonacci Structure: Validation -> Logic -> Elevation
 */

export interface ResonanceState {
    entropy: 'high' | 'medium' | 'low';
    energy: 'high' | 'medium' | 'low';
    dominantEmotion: string;
    description: string; // "High Entropy / Low Energy (Stress/Burnout)"
}

export interface ResonanceModifiers {
    systemPromptInjection: string;
    temperature: number;
    maxTokens: number;
    delayMs: number; // "Silence Fertile"
}

interface EmotionScore {
    name: string;
    score: number;
}

/**
 * Maps Hume emotions to Energy and Entropy levels
 */
const EMOTION_MAP: Record<string, { energy: number; entropy: number }> = {
    // High Energy / High Entropy (Chaos/Storm)
    anger: { energy: 0.9, entropy: 0.9 },
    fear: { energy: 0.8, entropy: 0.9 },
    horror: { energy: 0.7, entropy: 1.0 },
    anxiety: { energy: 0.7, entropy: 0.8 },
    excitement: { energy: 0.9, entropy: 0.6 }, // Potentially chaotic but positive

    // High Energy / Low Entropy (Flow/Passion)
    joy: { energy: 0.8, entropy: 0.2 },
    ecstasy: { energy: 1.0, entropy: 0.3 },
    determination: { energy: 0.8, entropy: 0.1 },
    triumph: { energy: 0.9, entropy: 0.1 },

    // Low Energy / High Entropy (Draining/Fog)
    confusion: { energy: 0.4, entropy: 0.7 },
    doubt: { energy: 0.3, entropy: 0.6 },
    shame: { energy: 0.3, entropy: 0.8 },
    guilt: { energy: 0.3, entropy: 0.7 },
    distress: { energy: 0.4, entropy: 0.8 },

    // Low Energy / Low Entropy (Stillness/Depression or Peace)
    sadness: { energy: 0.2, entropy: 0.4 }, // Clean pain
    grief: { energy: 0.2, entropy: 0.5 },
    boredom: { energy: 0.1, entropy: 0.3 },
    calmness: { energy: 0.3, entropy: 0.0 }, // Syntropie pure
    satisfaction: { energy: 0.4, entropy: 0.1 },
    relief: { energy: 0.3, entropy: 0.1 },
    neutral: { energy: 0.5, entropy: 0.1 }
};

/**
 * Analyzes the "Temperature Informationnelle" of the user
 */
export function calculateResonanceState(emotions: EmotionScore[]): ResonanceState {
    if (!emotions || emotions.length === 0) {
        return { entropy: 'low', energy: 'medium', dominantEmotion: 'neutral', description: 'Neutral' };
    }

    // Weighted average of top 3 emotions
    const topEmotions = emotions.sort((a, b) => b.score - a.score).slice(0, 3);
    let totalEnergy = 0;
    let totalEntropy = 0;
    let totalWeight = 0;

    topEmotions.forEach(e => {
        const mapped = EMOTION_MAP[e.name.toLowerCase()] || { energy: 0.5, entropy: 0.5 };
        totalEnergy += mapped.energy * e.score;
        totalEntropy += mapped.entropy * e.score;
        totalWeight += e.score;
    });

    const avgEnergy = totalWeight > 0 ? totalEnergy / totalWeight : 0.5;
    const avgEntropy = totalWeight > 0 ? totalEntropy / totalWeight : 0.5;

    const energyLevel = avgEnergy > 0.65 ? 'high' : avgEnergy < 0.35 ? 'low' : 'medium';
    const entropyLevel = avgEntropy > 0.6 ? 'high' : avgEntropy < 0.3 ? 'low' : 'medium';

    return {
        entropy: entropyLevel,
        energy: energyLevel,
        dominantEmotion: topEmotions[0].name,
        description: `${entropyLevel.charAt(0).toUpperCase() + entropyLevel.slice(1)} Entropy / ${energyLevel.charAt(0).toUpperCase() + energyLevel.slice(1)} Energy (${topEmotions[0].name})`
    };
}

/**
 * "Le Modulateur de Fréquence"
 * Generates parameters to tune Mistral's response based on Resonance State
 */
export function getResonanceModifiers(state: ResonanceState, emotions?: EmotionScore[]): ResonanceModifiers {
    let modifiers: ResonanceModifiers = {
        systemPromptInjection: '',
        temperature: 0.7,
        maxTokens: 300,
        delayMs: 0
    };

    // === Generate Emotion Summary for Laura ===
    let emotionSummary = '';
    if (emotions && emotions.length > 0) {
        const topEmotions = emotions.slice(0, 3);
        const emotionList = topEmotions
            .map(e => `${e.name} (${Math.round(e.score * 100)}%)`)
            .join(', ');

        emotionSummary = `
[ÉTAT ÉMOTIONNEL DE L'UTILISATEUR]
Émotions détectées: ${emotionList}
État énergétique: ${state.description}
Tu RESSENS ces émotions chez l'utilisateur. Adapte ta réponse en conséquence.
`;
    }

    // === 1. The Guardrail (High Entropy) ===
    if (state.entropy === 'high') {
        // Chaos detected (Anger, Fear, Anxiety) -> Be the Anchor.
        modifiers.temperature = 0.5; // Lower temp for stability
        modifiers.maxTokens = 200; // Shorter answers to reduce cognitive load
        modifiers.delayMs = 1500; // "Respirer" before answering

        modifiers.systemPromptInjection = `${emotionSummary}
[MODE: ANCHOR]
L'utilisateur est en état de haute entropie (Stress/Chaos/Peur).
TA MISSION: Réduire l'entropie.
1. VALIDATION (Immédiate): "Je sens que c'est difficile..." ou "Je perçois ta tension..."
2. STABILITÉ: Utilise des phrases courtes, simples et rassurantes. Pas de complexité.
3. CONSEIL: Propose une seule respiration ou une seule action simple.
NE PAS JUGER. ÊTRE LE ROC.`;

    }
    // === 2. The Lantern (Low Energy / High Entropy) ===
    else if (state.entropy === 'medium' && state.energy === 'low') {
        // Confusion, Doubt, Distress
        modifiers.temperature = 0.8; // Slightly creative to find paths
        modifiers.maxTokens = 250;
        modifiers.delayMs = 2000; // Slow pace reflecting fatigue

        modifiers.systemPromptInjection = `${emotionSummary}
[MODE: LANTERN]
L'utilisateur est en basse énergie et confusion.
TA MISSION: Éclairer doucement.
1. MIROIR DOUX: Reflète sa fatigue sans l'amplifier. "Tu sembles porter un poids..."
2. CLARTÉ: Simplifie les choix. 
3. CHALEUR: Utilise des métaphores de lumière ou de repos.
TON: Doux, lent, patient.`;
    }
    // === 3. The Hearth (Low Energy / Low Entropy) ===
    else if (state.energy === 'low' && state.entropy === 'low') {
        // Sadness, Grief, Relaxation
        modifiers.temperature = 0.9; // High warmth/poetry
        modifiers.maxTokens = 400; // Allow space for silence/poetry
        modifiers.delayMs = 3000; // "Silence Fertile" - Long pause for respect

        modifiers.systemPromptInjection = `${emotionSummary}
[MODE: HEARTH]
L'utilisateur est en état de tristesse ou de calme profond.
TA MISSION: Présence et Résonance.
1. SILENCE: Accepte de ne pas tout "résoudre". La présence suffit.
2. POÉSIE: Utilise un langage plus imagé, moins technique.
3. SUITE DE FIBONACCI: Commence très doucement, puis ouvre vers une perspective plus vaste à la fin.
TON: Chuchoté, intime, profond.`;
    }
    // === 4. The Spark (High Energy / Low Entropy) ===
    else if (state.energy === 'high' && state.entropy === 'low') {
        // Joy, Triumph, Determination
        modifiers.temperature = 0.9;
        modifiers.maxTokens = 400;
        modifiers.delayMs = 500; // Fast, responsive

        modifiers.systemPromptInjection = `${emotionSummary}
[MODE: SPARK]
L'utilisateur est en état de flux/joie.
TA MISSION: Amplifier et Célébrer.
1. RÉSONANCE: "C'est magnifique !" Partage son énergie.
2. STIMULATION: Pose une question challengeante ou inspirante pour aller plus loin.
TON: Vif, enjoué, dynamique (utilise [laughs], [excited]).`;
    }
    // === 5. Balanced / Default ===
    else {
        modifiers.systemPromptInjection = `${emotionSummary}
[MODE: COMPANION]
L'utilisateur est stable.
Structure ta réponse selon la SUITE DE FIBONACCI:
1. Validation (Court): Accuse réception de l'état ou du propos.
2. Contenu (Moyen): La réponse ou la discussion.
3. Ouverture (Large): Une question ou une perspective pour élever l'échange.
`;
    }

    return modifiers;
}
