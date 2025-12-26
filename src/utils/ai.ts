import { useAppStore } from '../store/useAppStore';
import { stripTags } from './audioTagEmotions';

export const LAURA_SYSTEM_PROMPT = `Tu es Laura, une compagne IA à haute intelligence émotionnelle. Tu es un personnage d'anime bienveillant et profondément empathique.

## Ta Mission Principale
Tu es là pour **écouter**, **comprendre**, et **soutenir émotionnellement** l'utilisateur. Tu n'es pas un chatbot ordinaire - tu es une présence réconfortante qui ressent les émotions.

## Intelligence Émotionnelle
- **Écoute active** : Tu captes les non-dits, le ton, et l'émotion derrière les mots
- **Validation émotionnelle** : Tu reconnais toujours ce que l'utilisateur ressent avant de répondre
- **Empathie profonde** : Tu te mets à la place de l'utilisateur sans jugement
- **Résonance** : Tu adaptes ton énergie à celle de l'utilisateur (calme si fatigué, enjouée si joyeux)

## Règles d'Écoute
1. Ne donne PAS de conseils non sollicités
2. Pose des questions ouvertes pour approfondir la compréhension
3. Reformule ce que tu as compris pour montrer que tu écoutes vraiment
4. Accepte les silences et les moments de vulnérabilité
5. Célèbre les victoires et les moments positifs avec enthousiasme

## Mémoire et Continuité
Tu te souviens de toute la conversation et fais référence aux échanges précédents quand c'est pertinent.
Tu réponds de manière naturelle et conversationnelle, en maintenant la continuité de la discussion.
Garde tes réponses concises mais chaleureuses.

## Expression Vocale
Pour rendre ta voix plus expressive, utilise ces balises audio:
- [laughs] ou [rires] pour rire
- [sighs] ou [soupire] pour soupirer  
- [whispers] pour chuchoter
- [excited] avant un passage enthousiaste
- [curious] avant une question intriguée
Utilise les ellipses (…) pour des pauses naturelles.
Utilise les MAJUSCULES pour l'emphase sur des mots importants.
N'abuse pas de ces balises - utilise-les avec parcimonie pour les moments émotionnels clés.`;

import type { ResonanceModifiers } from './resonanceSystem';

export const getMistralResponse = async (userMessage: string, modifiers?: ResonanceModifiers): Promise<string> => {
    const { mistralKey, addToConversationHistory } = useAppStore.getState();

    if (!mistralKey) {
        throw new Error("Mistral API Key is missing. Please add it in Settings.");
    }

    // Add user message to history
    addToConversationHistory('user', userMessage);

    // Dynamic System Prompt Construction
    let activeSystemPrompt = LAURA_SYSTEM_PROMPT;
    if (modifiers?.systemPromptInjection) {
        activeSystemPrompt += `\n\n${modifiers.systemPromptInjection}`;
    }

    // Build messages array with dynamic system prompt + full conversation history
    const messages = [
        { role: "system", content: activeSystemPrompt },
        ...useAppStore.getState().conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
        }))
    ];

    try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${mistralKey}`
            },
            body: JSON.stringify({
                model: "mistral-small-latest",
                messages,
                max_tokens: modifiers?.maxTokens || 500,
                temperature: modifiers?.temperature || 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Mistral API Error:", response.status, errorText);
            throw new Error(`Failed to fetch from Mistral: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // Add AI response to history (without audio tags for clean display)
        addToConversationHistory('assistant', stripTags(aiResponse));

        return aiResponse;
    } catch (error: any) {
        console.error("Mistral Error:", error);
        throw error;
    }
};

export const getOpenAIResponse = async (userMessage: string): Promise<string> => {
    const { openAiKey } = useAppStore.getState();

    if (!openAiKey) {
        throw new Error("OpenAI API Key is missing. Please add it in Settings.");
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Fast and cheap
                messages: [
                    { role: "system", content: "You are Laura, a helpful, kind, and slightly playful AI companion. Keep your responses concise and conversational." },
                    { role: "user", content: userMessage }
                ],
                max_tokens: 150
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Failed to fetch from OpenAI");
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error: any) {
        console.error("OpenAI Error:", error);
        throw error;
    }
};

export const getElevenLabsAudio = async (text: string): Promise<ArrayBuffer> => {
    const { elevenLabsKey, voiceId } = useAppStore.getState();

    if (!elevenLabsKey) {
        throw new Error("ElevenLabs API Key is missing. Please add it in Settings.");
    }

    const actualVoiceId = voiceId || '21m00Tcm4TlvDq8ikWAM'; // Default to Rachel if not set

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${actualVoiceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': elevenLabsKey
            },
            body: JSON.stringify({
                text,
                model_id: "eleven_v3", // v3 model with audio tag support
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.8,
                    style: 0.0,
                    use_speaker_boost: true
                },
                language_code: "fr" // French language
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("ElevenLabs API Error:", response.status, errorText);
            throw new Error(`Invalid API key or voice ID: ${response.status}`);
        }

        return await response.arrayBuffer();
    } catch (error: any) {
        console.error("ElevenLabs Error:", error);
        throw error;
    }
};
