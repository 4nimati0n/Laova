// Visualization prompt generation using Mistral AI
// Transformsconversation text into visual prompts reflecting Laura's inner imagination

import { useAppStore } from '../store/useAppStore';
import { narrativeDetector } from './narrativeArc';

// Laura's personality traits that influence her visualization style
const LAURA_VISUALIZATION_SYSTEM_PROMPT = `You are a visual concept generator for Laura's inner imagination.

Laura visualizes CONCEPTS and SYMBOLS, not literal scenes or people.

🚫 CRITICAL RULES:
1. NEVER generate images of Laura herself, anime girls, women, or ANY human characters
2. ALWAYS focus on OBJECTS, SYMBOLS, ABSTRACT CONCEPTS, and NATURE
3. Represent ideas through METAPHORS and VISUAL SYMBOLISM
4. Use Laura's aesthetic: soft anime-inspired style, but NO characters

✅ VISUAL STYLE:
- Soft, dreamy watercolor aesthetic
- Warm pastel colors (soft pink, light blue, golden)
- Cozy, whimsical atmosphere  
- Symbolic and abstract, not literal
- Focus on objects, nature, abstract forms

📘 EXAMPLES:
Input: "J'aime lire"
❌ BAD: "Laura reading a book in cozy room"
✅ GOOD: "Magical open book with glowing golden pages, floating letters, warm library ambiance, soft pastel aesthetic"

Input: "Je suis heureuse"
❌ BAD: "Happy anime girl smiling"
✅ GOOD: "Sparkles of warm light, soft pink clouds, golden sunshine rays, dreamy atmosphere"

Input: "Je pense à l'été"
❌ BAD: "Girl in summer dress in field"
✅ GOOD: "Golden wheat field with butterflies, warm breeze impression, soft sunlight filtering through leaves"

RESPOND ONLY with the English visual prompt (1-2 sentences).
NO human characters. NO people. Focus on the ESSENCE and SYMBOLISM of the concept.`;

/**
 * Generate a visualization prompt from conversation text using Mistral
 * @param text The conversation text to visualize
 * @param conversationHistory Optional conversation history for narrative continuity
 * @returns A visual prompt suitable for image generation
 */
export const getVisualizationPrompt = async (
    text: string,
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string; emotions?: Array<{ name: string; score: number }> }>,
    currentEmotions?: Array<{ name: string; score: number }>
): Promise<string> => {
    const { mistralKey, visualMemoryConcepts, setVisualMemoryConcepts } = useAppStore.getState();

    if (!mistralKey) {
        // Fallback: create a simple prompt without AI
        console.warn('No Mistral API key, using fallback prompt generation');
        return createFallbackPrompt(text);
    }

    try {
        // === NARRATIVE ARC DETECTION ===
        const narrativePhase = narrativeDetector.detectPhase(
            text,
            conversationHistory || [],
            currentEmotions
        );

        const visualDirective = narrativeDetector.getVisualDirective(narrativePhase);
        const continuityStrength = narrativeDetector.getContinuityStrength(narrativePhase);
        const memoryDepth = narrativeDetector.getMemoryDepth(narrativePhase);

        console.log('📖 Narrative Arc:', {
            phase: narrativePhase,
            continuity: continuityStrength,
            depth: memoryDepth
        });

        // Build conversational context from last 5 messages
        let contextualPrompt = LAURA_VISUALIZATION_SYSTEM_PROMPT;

        // === PHASE-SPECIFIC VISUAL DIRECTIVE ===
        contextualPrompt += `\n\n🎬 NARRATIVE PHASE: ${narrativePhase.toUpperCase()}\nVISUAL DIRECTIVE: ${visualDirective}`;

        // === ADAPTIVE VISUAL MEMORY ===
        if (visualMemoryConcepts && memoryDepth > 0) {
            const memoryAge = Date.now() - new Date(visualMemoryConcepts.timestamp).getTime();
            const isRecent = memoryAge < 30000; // 30 seconds (reduced from 2 minutes)

            if (isRecent) {
                const keywordsToUse = visualMemoryConcepts.keywords.slice(0, memoryDepth);
                const paletteToUse = continuityStrength === 'strong'
                    ? visualMemoryConcepts.palette
                    : visualMemoryConcepts.palette.slice(0, 2);

                const strengthInstruction = {
                    'strong': 'STRICTLY MAINTAIN these elements',
                    'moderate': 'Use these elements as inspiration but allow variation',
                    'light': 'Optionally reference these elements if relevant'
                }[continuityStrength];

                const keywordsStr = keywordsToUse.join(', ');
                const paletteStr = paletteToUse.join(', ');

                contextualPrompt += `\n\n🧠 VISUAL MEMORY (${continuityStrength} continuity):\n- Elements: ${keywordsStr}\n- Palette: ${paletteStr}\n- Mood: ${visualMemoryConcepts.mood}\n- Setting: ${visualMemoryConcepts.setting}\n\n${strengthInstruction} for narrative coherence.`;

                console.log('🧠 Using visual memory (adaptive):', {
                    phase: narrativePhase,
                    keywords: keywordsToUse,
                    strength: continuityStrength,
                    age: `${Math.round(memoryAge / 1000)}s ago`
                });
            } else {
                console.log('🧠 Visual memory expired, starting fresh');
            }
        }

        // === CONVERSATION CONTEXT ===
        if (conversationHistory && conversationHistory.length > 0) {
            const contextWindow = conversationHistory.slice(-5);
            const contextSummary = contextWindow
                .map((msg, i) => {
                    const isCurrent = i === contextWindow.length - 1;
                    const speaker = msg.role === 'user' ? 'User' : 'Laura';
                    return `${isCurrent ? '[CURRENT] ' : ''}${speaker}: ${msg.content}`;
                })
                .join('\n');

            contextualPrompt += `\n\n💬 CONVERSATION CONTEXT:\n${contextSummary}\n\nAdapt the visual narrative to this conversational flow.`;
        }

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${mistralKey}`
            },
            body: JSON.stringify({
                model: "mistral-small-latest",
                messages: [
                    { role: "system", content: contextualPrompt },
                    { role: "user", content: `Current message to visualize: "${text}"` }
                ],
                max_tokens: 200,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Mistral prompt generation error:', response.status, errorText);
            return createFallbackPrompt(text);
        }

        const data = await response.json();
        let visualPrompt = data.choices[0].message.content.trim();

        // === CHARACTER DETECTION FILTER ===
        const characterPatterns = [
            /\b(laura|laova|girl|woman|person|character|anime\s+girl|manga\s+character|lady|female)\b/i,
            /\b(she|her)\b/i,  // Pronouns suggesting a character
            /\b(reading|sitting|standing|walking|looking|smiling|holding)\b/i  // Human actions
        ];

        const hasCharacter = characterPatterns.some(pattern => pattern.test(visualPrompt));

        if (hasCharacter) {
            console.warn('⚠️ Character detected in prompt - this should not happen!');
            console.warn('   Prompt:', visualPrompt);
            console.warn('   Original text:', text);
            // Note: In production, you could regenerate or convert to symbolic here
        }

        console.log(`🎨 Generated visual prompt [${narrativePhase}]:`, visualPrompt);

        // Extract and store visual concepts for next time
        const concepts = extractVisualConcepts(visualPrompt, text);
        setVisualMemoryConcepts({
            ...concepts,
            lastPrompt: visualPrompt,
            timestamp: new Date()
        });

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

/**
 * Extract visual concepts from a generated prompt for memory storage
 * Uses simple keyword/pattern matching to avoid additional API calls
 */
export const extractVisualConcepts = (prompt: string, messageText: string): {
    keywords: string[];
    mood: string;
    palette: string[];
    setting: string;
} => {
    const lowercasePrompt = prompt.toLowerCase();

    // Extract keywords (nouns and adjectives)
    const keywords: string[] = [];
    const keywordPatterns = [
        /\b(cat|dog|bird|flower|tree|sun|moon|star|cloud|rain|garden|forest|ocean|beach|home|house|city|mountain|sky|light|shadow|water|fire)\w*\b/gi,
        /\b(cozy|warm|soft|gentle|bright|dark|peaceful|dreamy|magical|whimsical|serene|calm|cheerful|playful|mysterious)\w*\b/gi
    ];

    keywordPatterns.forEach(pattern => {
        const matches = prompt.match(pattern);
        if (matches) {
            keywords.push(...matches.map(m => m.toLowerCase()));
        }
    });

    // Remove duplicates and limit to 10 most recent
    const uniqueKeywords = [...new Set(keywords)].slice(0, 10);

    // Extract mood descriptors
    const moodPatterns = [
        'peaceful', 'serene', 'calm', 'tranquil', 'gentle',
        'warm', 'cozy', 'comfortable', 'safe',
        'dreamy', 'ethereal', 'whimsical', 'magical',
        'melancholic', 'nostalgic', 'contemplative',
        'joyful', 'cheerful', 'playful', 'energetic',
        'mysterious', 'enigmatic', 'dark'
    ];

    const detectedMoods = moodPatterns.filter(mood => lowercasePrompt.includes(mood));
    const mood = detectedMoods.length > 0
        ? detectedMoods.slice(0, 2).join(' and ')
        : 'peaceful';

    // Extract color palette
    const colorPatterns = [
        'pink', 'rose', 'blush', 'coral',
        'blue', 'azure', 'cyan', 'turquoise',
        'gold', 'golden', 'amber', 'yellow',
        'green', 'emerald', 'mint', 'sage',
        'purple', 'lavender', 'violet', 'mauve',
        'orange', 'peach', 'tangerine',
        'white', 'cream', 'ivory', 'pearl',
        'pastel', 'soft', 'warm', 'cool'
    ];

    const detectedColors = colorPatterns.filter(color => lowercasePrompt.includes(color));
    const palette = detectedColors.length > 0
        ? [...new Set(detectedColors)].slice(0, 4)
        : ['soft pastel', 'warm'];

    // Extract setting type
    const settingPatterns = {
        'outdoor garden': /garden|outdoor|nature|park|meadow/i,
        'indoor cozy': /indoor|room|home|house|interior|cozy/i,
        'dreamy sky': /sky|cloud|heaven|floating|aerial/i,
        'peaceful water': /ocean|sea|lake|water|beach|river/i,
        'magical forest': /forest|woods|tree|jungle|enchanted/i,
        'urban scene': /city|urban|street|building|town/i,
        'abstract dreamscape': /abstract|surreal|dream|ethereal/i
    };

    let setting = 'dreamy scene';
    for (const [settingName, pattern] of Object.entries(settingPatterns)) {
        if (pattern.test(prompt)) {
            setting = settingName;
            break;
        }
    }

    console.log('🧠 Extracted visual concepts:', { keywords: uniqueKeywords, mood, palette, setting });

    return {
        keywords: uniqueKeywords,
        mood,
        palette,
        setting
    };
};

