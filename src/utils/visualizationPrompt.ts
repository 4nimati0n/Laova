// Visualization prompt generation using Mistral AI
// Transforms conversation text into visual prompts reflecting Laura's inner imagination

import { useAppStore } from '../store/useAppStore';

// Laura's personality traits that influence her visualization style
const LAURA_VISUALIZATION_SYSTEM_PROMPT = `Tu es un assistant qui transforme du texte en prompts visuels pour Laura.
Laura est un personnage d'anime gentil, enjoué et serviable. Sa vision intérieure est unique à sa personnalité:

TRAITS DE SA VISUALISATION INTÉRIEURE:
- Douce et rêveuse (comme des aquarelles douces)
- Style anime/manga subtil
- Couleurs chaudes et pastel (roses doux, bleus clairs, dorés)
- Atmosphère cozy et whimsique
- Éléments mignons et réconfortants
- Lumière douce et flatteuse

RÈGLES:
1. Analyse le texte pour en extraire les concepts visuels clés
2. Transforme ces concepts en une scène visuelle cohérente
3. Applique toujours le style doux et anime de Laura
4. Évite tout élément négatif, effrayant ou violent
5. Réponds UNIQUEMENT avec le prompt en anglais (1-2 phrases)
6. Ne donne aucune explication, juste le prompt

EXEMPLES:
- "J'aime les chats" → "A cozy scene with fluffy white cats playing with yarn, soft pastel colors, warm sunlight through a window, gentle anime style"
- "Le soleil brille" → "Golden morning sunlight streaming through soft clouds, whimsical floating petals, dreamy warm atmosphere"
- "Je suis triste" → "A quiet rainy window with soft raindrops, warm tea cup with steam, gentle melancholic mood, cozy interior"`;

/**
 * Generate a visualization prompt from conversation text using Mistral
 * @param text The conversation text to visualize
 * @returns A visual prompt suitable for image generation
 */
export const getVisualizationPrompt = async (text: string): Promise<string> => {
    const { mistralKey } = useAppStore.getState();

    if (!mistralKey) {
        // Fallback: create a simple prompt without AI
        console.warn('No Mistral API key, using fallback prompt generation');
        return createFallbackPrompt(text);
    }

    try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${mistralKey}`
            },
            body: JSON.stringify({
                model: "mistral-small-latest",
                messages: [
                    { role: "system", content: LAURA_VISUALIZATION_SYSTEM_PROMPT },
                    { role: "user", content: `Texte à visualiser: "${text}"` }
                ],
                max_tokens: 150,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Mistral prompt generation error:', response.status, errorText);
            return createFallbackPrompt(text);
        }

        const data = await response.json();
        const visualPrompt = data.choices[0].message.content.trim();

        console.log('🎨 Generated visual prompt:', visualPrompt);
        return visualPrompt;

    } catch (error: any) {
        console.error('Visualization prompt generation failed:', error);
        return createFallbackPrompt(text);
    }
};

/**
 * Fallback prompt generation when Mistral is unavailable
 * Uses simple keyword extraction and template matching
 */
const createFallbackPrompt = (text: string): string => {
    const lowercaseText = text.toLowerCase();

    // Keywords to concepts mapping
    const conceptMappings: Record<string, string> = {
        // Emotions
        'heureux|heureuse|content|joyeux|joie|happy': 'joyful scene with floating sparkles and warm light',
        'triste|sad|malheureux': 'gentle rainy window with warm tea, cozy melancholic mood',
        'amour|love|aime|adore': 'soft pink hearts and cherry blossoms, romantic atmosphere',
        'peur|afraid|scared': 'small comforting light in soft darkness, protective warmth',

        // Nature
        'soleil|sun|sunny': 'golden sunlight through soft clouds, warm glowing atmosphere',
        'lune|moon|nuit|night': 'gentle moonlight with twinkling stars, peaceful night scene',
        'fleur|flower|rose': 'beautiful blooming flowers in pastel colors, garden scene',
        'arbre|tree|forêt|forest': 'magical forest with soft dappled light, enchanted trees',
        'mer|ocean|sea|plage|beach': 'peaceful ocean waves with soft sunset, gentle beach scene',
        'pluie|rain': 'soft rain on window, cozy interior with warm lighting',

        // Animals
        'chat|cat|chaton|kitten': 'fluffy adorable cats in cozy setting, warm and cute',
        'chien|dog|puppy': 'playful happy dogs with wagging tails, cheerful scene',
        'oiseau|bird': 'colorful birds singing among flowers, peaceful morning',

        // Activities
        'musique|music': 'floating musical notes with soft glow, melodic atmosphere',
        'livre|book|lire|read': 'cozy reading corner with warm lamp, magical books',
        'cuisine|cook|food|manger|eat': 'delicious warm food with steam, cozy kitchen scene',
        'dormir|sleep|rêve|dream': 'soft clouds and starlight, peaceful dreaming scene',

        // Places
        'maison|home|house': 'warm cozy home interior with soft lighting',
        'ville|city': 'magical city lights at dusk, dreamy urban scene',
        'jardin|garden': 'beautiful secret garden with flowers and butterflies',
    };

    // Find matching concepts
    const matchedConcepts: string[] = [];
    for (const [pattern, concept] of Object.entries(conceptMappings)) {
        if (new RegExp(pattern, 'i').test(lowercaseText)) {
            matchedConcepts.push(concept);
        }
    }

    // Build the prompt
    let prompt: string;
    if (matchedConcepts.length > 0) {
        prompt = matchedConcepts.slice(0, 2).join(', ');
    } else {
        // Default peaceful scene
        prompt = 'peaceful dreamy scene with soft pastel colors and gentle light';
    }

    // Always add Laura's signature style
    prompt += ', soft anime aesthetic, watercolor texture, warm cozy atmosphere';

    console.log('🎨 Fallback prompt generated:', prompt);
    return prompt;
};

/**
 * Extracts visual mood from Hume emotions if available
 * Can be used to enhance prompts with emotional context
 */
export const getMoodFromEmotions = (emotions?: Array<{ name: string; score: number }>): string => {
    if (!emotions || emotions.length === 0) {
        return 'peaceful gentle mood';
    }

    const topEmotion = emotions[0];
    const emotionToMood: Record<string, string> = {
        'joy': 'joyful bright atmosphere',
        'happiness': 'happy warm glowing mood',
        'excitement': 'energetic sparkling atmosphere',
        'love': 'love-filled soft pink tones',
        'admiration': 'admiring beautiful golden light',
        'interest': 'curious whimsical elements',
        'amusement': 'playful fun atmosphere',
        'contentment': 'peaceful serene mood',
        'calmness': 'calm tranquil atmosphere',
        'sadness': 'gentle melancholic soft blues',
        'nostalgia': 'nostalgic warm sepia tones',
        'contemplation': 'thoughtful misty atmosphere',
    };

    return emotionToMood[topEmotion.name.toLowerCase()] || 'peaceful gentle mood';
};
