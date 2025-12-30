import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getOpenAIResponse, getMistralResponse, getElevenLabsAudio, LAURA_SYSTEM_PROMPT } from '../utils/ai';
import { getElevenLabsAgentResponse } from '../utils/elevenLabsAgent';
import { useVoice } from '@humeai/voice-react';
import { extractTags, tagToEmotion, stripTags, getEmotionIntensity } from '../utils/audioTagEmotions';
import { useVisualization } from './useVisualization';
import { calculateResonanceState, getResonanceModifiers } from '../utils/resonanceSystem';
import type { ResonanceModifiers } from '../utils/resonanceSystem';
import { getChatGroupIdForResume } from '../utils/conversationSession';

export const useVoiceInteraction = () => {
    const {
        isPlaying,
        setIsListening,
        setIsSpeaking,
        setUserMessage,
        setAiResponse,
        setError,
        openAiKey,
        mistralKey,
        elevenLabsKey,
        useElevenLabsAgent,
        setAudioAnalyser,
        useHume,
        humeAccessToken,
        humeConfigId,
        chatGroupId,
        setChatGroupId,
        isHumePaused,
        pauseConversation,
        resumeConversation,
        setHumeFft,
        triggerEmotion,
        setEmotionIntensity
    } = useAppStore();

    // Hume Hook
    const {
        connect: connectHume,
        disconnect: disconnectHume,
        readyState: humeReadyState,
        messages: humeMessages,
        sendUserInput: sendHumeUserInput,
        fft: humeFftData
    } = useVoice();

    // Visualization hook for inner imagery
    const { triggerVisualization } = useVisualization();

    // Sync Hume FFT to Store
    useEffect(() => {
        if (useHume && humeFftData) {
            setHumeFft(humeFftData);
            // Simple speaking detection based on FFT energy
            const energy = humeFftData.reduce((a, b) => a + b, 0) / humeFftData.length;
            if (energy > 0.01) {
                setIsSpeaking(true);
            } else {
                setIsSpeaking(false);
            }
        }
    }, [useHume, humeFftData, setHumeFft, setIsSpeaking]);

    // Track processed Hume messages to avoid duplicates
    const processedHumeMessagesRef = useRef<Set<string>>(new Set());

    // Handle Hume Messages
    useEffect(() => {
        if (!useHume) return;

        const lastMessage = humeMessages[humeMessages.length - 1];
        if (!lastMessage) return;

        // Create unique ID for this message
        const messageId = `${lastMessage.type}-${(lastMessage as any).message?.content?.substring(0, 50) || ''}-${humeMessages.length}`;

        // Skip if already processed
        if (processedHumeMessagesRef.current.has(messageId)) return;

        // Skip interim messages (they don't have emotion models yet and cause duplicates)
        if ((lastMessage as any).interim) return;

        processedHumeMessagesRef.current.add(messageId);

        if (lastMessage.type === 'user_message' && lastMessage.message.content) {
            // Extract top 3 emotions from prosody scores
            const prosodyScores = (lastMessage as any).models?.prosody?.scores;
            let topEmotions: Array<{ name: string; score: number }> | undefined;

            if (prosodyScores) {
                const emotionEntries = Object.entries(prosodyScores) as [string, number][];
                topEmotions = emotionEntries
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([name, score]) => ({ name, score }));
            }

            setUserMessage(lastMessage.message.content);
            console.log('🎭 Hume user_message received');
            console.log('🎭 Hume emotions detected:', topEmotions);
            useAppStore.getState().addToConversationHistory('user', lastMessage.message.content, topEmotions);

            // === AUREA INTEGRATION: Log Resonance State (for debugging) ===
            const resonanceState = calculateResonanceState(topEmotions || []);
            console.log('🔮 AUREA Resonance State:', resonanceState);

            // === VISUALIZATION: Trigger image generation for user's message ===
            // Generate visualization of what Laura imagines from the user's words
            triggerVisualization(lastMessage.message.content, topEmotions);
            console.log('🎨 Hume: Triggered visualization for user message');

            // Note: Hume STS handles the AI response, no need to call Mistral

        } else if (lastMessage.type === 'assistant_message' && lastMessage.message.content) {
            // Display Hume's assistant response
            console.log('💬 Hume Assistant Response:', lastMessage.message.content);
            setAiResponse(lastMessage.message.content);
            useAppStore.getState().addToConversationHistory('assistant', lastMessage.message.content);

            // === VISUALIZATION: Trigger image generation for Laura's response ===
            // Generate visualization of Laura's inner thoughts while responding
            triggerVisualization(lastMessage.message.content);
            console.log('🎨 Hume: Triggered visualization for assistant response');
        } else if (lastMessage.type === 'chat_metadata') {
            // Capture Chat Group ID for conversation continuity
            const newChatGroupId = (lastMessage as any).chat_group_id;
            if (newChatGroupId && newChatGroupId !== chatGroupId) {
                console.log('📚 Captured Chat Group ID:', newChatGroupId);
                setChatGroupId(newChatGroupId);
            }
        }
    }, [useHume, humeMessages, setUserMessage, setAiResponse, triggerVisualization, chatGroupId, setChatGroupId]);

    // Hume Connection Management - Pass systemPrompt and resumedChatGroupId
    useEffect(() => {
        if (useHume) {
            // Allow connection from both 'idle' and 'closed' states to support pause/resume
            if (isPlaying && humeAccessToken && (humeReadyState === 'idle' || humeReadyState === 'closed')) {
                // Build the complete system prompt with emotional intelligence
                const fullSystemPrompt = LAURA_SYSTEM_PROMPT;

                // Check if we should resume a previous conversation
                const resumeChatGroupId = getChatGroupIdForResume();

                console.log('🚀 Connecting to Hume EVI with custom systemPrompt...', {
                    currentState: humeReadyState,
                    resumingChatGroup: resumeChatGroupId
                });

                const connectionConfig: any = {
                    auth: { type: 'accessToken', value: humeAccessToken },
                    configId: humeConfigId,
                    systemPrompt: fullSystemPrompt
                };

                // Add resumedChatGroupId if available (for conversation continuity)
                if (resumeChatGroupId) {
                    connectionConfig.resumedChatGroupId = resumeChatGroupId;
                    console.log('📚 Resuming conversation with Chat Group:', resumeChatGroupId);
                }

                connectHume(connectionConfig).then(() => {
                    console.log('✅ Hume EVI connected with Laura\'s personality!');
                }).catch(e => {
                    console.error("Hume Connection Failed:", e);
                    setError("Failed to connect to Hume AI");
                });
            } else if (!isPlaying && (humeReadyState === 'open' || humeReadyState === 'connecting')) {
                console.log('🔌 Disconnecting Hume EVI...', { currentState: humeReadyState });
                disconnectHume();
            }
        }
    }, [useHume, isPlaying, humeAccessToken, humeConfigId, humeReadyState, connectHume, disconnectHume, setError]);

    // Sync isListening with Hume State
    useEffect(() => {
        if (useHume) {
            if (humeReadyState === 'open' || humeReadyState === 'connecting') {
                setIsListening(true);
            } else {
                setIsListening(false);
                setIsSpeaking(false);
            }
        }
    }, [useHume, humeReadyState, setIsListening, setIsSpeaking]);

    // Handle Hume Pause/Resume Actions
    useEffect(() => {
        if (!useHume || humeReadyState !== 'open') return;

        const handlePauseResume = () => {
            const { isHumePaused } = useAppStore.getState();

            if (isHumePaused) {
                console.log('⏸️ Pausing Hume Assistant...');
                sendHumeUserInput({ type: 'pause_assistant_message' } as any);
            } else {
                console.log('▶️ Resuming Hume Assistant...');
                sendHumeUserInput({ type: 'resume_assistant_message' } as any);
            }
        };

        // Subscribe to pause state changes
        const unsubscribe = useAppStore.subscribe(
            (state) => state.isHumePaused,
            handlePauseResume
        );

        return unsubscribe;
    }, [useHume, humeReadyState, sendHumeUserInput]);


    const recognitionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    // ... (Existing playAudio, speak, processUserMessage functions)
    // We need to wrap them or conditionally execute them only if !useHume

    const playAudio = useCallback(async (audioBuffer: ArrayBuffer) => {
        if (useHume) return; // Hume handles audio playback

        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioContextRef.current.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;
            setAudioAnalyser(analyser);
        }

        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }

        try {
            const bufferClone = audioBuffer.slice(0);
            const buffer = await ctx.decodeAudioData(bufferClone);
            const source = ctx.createBufferSource();
            source.buffer = buffer;

            if (analyserRef.current) {
                source.connect(analyserRef.current);
                analyserRef.current.connect(ctx.destination);
            } else {
                source.connect(ctx.destination);
            }

            source.onended = () => setIsSpeaking(false);
            setIsSpeaking(true);
            source.start(0);
            useAppStore.getState().setLastAudioBuffer(audioBuffer);
        } catch (e) {
            console.error("Error playing audio:", e);
            setError("Failed to play audio response.");
            setIsSpeaking(false);
        }
    }, [setIsSpeaking, setError, setAudioAnalyser, useHume]);

    // Replay Listener
    useEffect(() => {
        const handleReplay = () => {
            const { lastAudioBuffer, isSpeaking } = useAppStore.getState();
            if (lastAudioBuffer && !isSpeaking && !useHume) {
                playAudio(lastAudioBuffer);
            }
        };
        window.addEventListener('replay-audio', handleReplay);
        return () => window.removeEventListener('replay-audio', handleReplay);
    }, [playAudio, useHume]);

    const speak = useCallback(async (text: string) => {
        if (useHume) return; // Hume speaks automatically

        if (elevenLabsKey) {
            try {
                const audioData = await getElevenLabsAudio(text);
                await playAudio(audioData);
                return;
            } catch (e) {
                console.error("ElevenLabs TTS failed", e);
                setError("Voice synthesis failed");
            }
        } else {
            setError("ElevenLabs API key required for voice");
        }
    }, [setIsSpeaking, setError, elevenLabsKey, playAudio, useHume]);

    const isProcessing = useRef(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const processUserMessage = useCallback(async (message: string, modifiers?: ResonanceModifiers) => {
        if (useHume && !modifiers) {
            sendHumeUserInput(message);
            return;
        }

        if (isProcessing.current) return;
        isProcessing.current = true;

        let response = "";

        if (useElevenLabsAgent && elevenLabsKey) {
            try {
                const agentResponse = await getElevenLabsAgentResponse(message, elevenLabsKey);
                response = agentResponse.text;
                setAiResponse(response);

                if (agentResponse.audioData) {
                    await playAudio(agentResponse.audioData);
                } else if (agentResponse.audioUrl) {
                    const audioResponse = await fetch(agentResponse.audioUrl);
                    const audioData = await audioResponse.arrayBuffer();
                    await playAudio(audioData);
                } else {
                    await speak(response);
                }
            } catch (e: any) {
                console.error("ElevenLabs Agent failed", e);
                setError(`Agent Error: ${e.message}`);
                response = "I'm having trouble connecting to my conversational agent.";
                await speak(response);
            } finally {
                isProcessing.current = false;
            }
            return;
        }

        // Trigger visualization for user's input (what Laura imagines from user's words)
        const userVizStartTime = Date.now();
        triggerVisualization(message);

        if (mistralKey) {
            try {
                if (modifiers?.delayMs) await new Promise(r => setTimeout(r, modifiers.delayMs));
                response = await getMistralResponse(message, modifiers);
            } catch (e: any) {
                console.error("Mistral failed", e);
                setError(`Mistral Error: ${e.message}`);
                response = "I'm having trouble thinking right now.";
            }
        } else if (openAiKey) {
            try {
                response = await getOpenAIResponse(message);
            } catch (e: any) {
                console.error("OpenAI failed", e);
                setError(`OpenAI Error: ${e.message}`);
                response = "I'm having trouble thinking right now.";
            }
        } else {
            const lowerMsg = message.toLowerCase();
            if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
                response = "Bonjour! Je suis Laura. Veuillez ajouter votre clé API Mistral dans les paramètres pour débloquer mon plein potentiel.";
            } else if (lowerMsg.includes('time')) {
                response = `Il est actuellement ${new Date().toLocaleTimeString()}.`;
            } else {
                response = `Vous avez dit: ${message}. J'ai besoin d'une clé API Mistral pour mieux comprendre.`;
            }
        }

        // Extract audio tags for emotion mapping
        const { firstTag, lastTag } = extractTags(response);
        const firstEmotion = tagToEmotion(firstTag);
        const lastEmotion = tagToEmotion(lastTag);

        // Trigger first emotion immediately (while waiting for audio)
        setEmotionIntensity(getEmotionIntensity(firstEmotion));
        triggerEmotion(firstEmotion);

        // Set a 2s timeout to reset emotion (will be cancelled when audio starts)
        const firstEmotionTimeout = setTimeout(() => {
            triggerEmotion('neutral');
        }, 2000);

        // Strip tags from displayed message
        const cleanResponse = stripTags(response);
        setAiResponse(cleanResponse);

        // Ensure user visualization stays at least 2 seconds before Laura's appears
        const userVizElapsed = Date.now() - userVizStartTime;
        const minDisplayTime = 2000; // 2 seconds minimum
        const waitTime = Math.max(0, minDisplayTime - userVizElapsed);

        if (waitTime > 0) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        // Cancel first emotion before audio starts (no overlap with lip sync)
        clearTimeout(firstEmotionTimeout);
        triggerEmotion('neutral');

        // Speak with original text (including tags for ElevenLabs processing)
        // Trigger Laura's visualization when speaking starts (inside playAudio/speak)
        const speakPromise = speak(response);

        // Trigger visualization for Laura's response once speaking starts
        triggerVisualization(cleanResponse);

        await speakPromise;

        // Trigger last emotion after audio ends (for 2 seconds)
        setEmotionIntensity(getEmotionIntensity(lastEmotion));
        triggerEmotion(lastEmotion);

        // Reset to neutral after 2 seconds
        setTimeout(() => triggerEmotion('neutral'), 2000);

        isProcessing.current = false;
    }, [setAiResponse, speak, openAiKey, mistralKey, elevenLabsKey, useElevenLabsAgent, setError, playAudio, useHume, sendHumeUserInput, triggerEmotion, setEmotionIntensity, triggerVisualization]);

    // Legacy Speech Recognition (Deepgram / Browser)
    useEffect(() => {
        if (useHume) return; // Disable legacy recognition if using Hume

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!SpeechRecognition) {
            console.error('Speech recognition not supported');
            useAppStore.getState().setError("Speech recognition not supported in this browser.");
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'fr-FR';

        recognitionRef.current.onstart = async () => {
            console.log("Voice recognition started");
            setIsListening(true);
            useAppStore.getState().setError(null);

            const { deepgramKey, useDeepgram } = useAppStore.getState();
            if (useDeepgram && deepgramKey) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorderRef.current = new MediaRecorder(stream);
                    audioChunksRef.current = [];

                    mediaRecorderRef.current.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            audioChunksRef.current.push(event.data);
                        }
                    };

                    mediaRecorderRef.current.start();
                } catch (e) {
                    console.error("Failed to start audio recording", e);
                }
            }
        };

        recognitionRef.current.onend = async () => {
            console.log("Voice recognition ended");
            setIsListening(false);

            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }

            const { isPlaying, isSpeaking } = useAppStore.getState();
            if (isPlaying && !isSpeaking) {
                console.log("Auto-restarting recognition...");
                try {
                    recognitionRef.current.start();
                } catch (e) {
                    console.error("Failed to restart recognition:", e);
                }
            }
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            if (event.error === 'not-allowed') {
                useAppStore.getState().setError("Microphone access denied. Please allow access.");
                useAppStore.getState().setIsPlaying(false);
            } else if (event.error === 'no-speech') {
                // Ignore
            } else {
                useAppStore.getState().setError(`Voice Error: ${event.error}`);
            }
        };

        recognitionRef.current.onresult = async (event: any) => {
            const { deepgramKey, useDeepgram, userDetectedEmotions } = useAppStore.getState();

            // Build ResonanceModifiers from face-api emotions
            const buildModifiersFromFaceEmotions = () => {
                if (userDetectedEmotions && userDetectedEmotions.length > 0) {
                    const resonanceState = calculateResonanceState(userDetectedEmotions);
                    const modifiers = getResonanceModifiers(resonanceState, userDetectedEmotions);
                    console.log('🎭 Face-api emotions detected:', userDetectedEmotions.slice(0, 3));
                    console.log('🔮 AUREA Resonance State:', resonanceState);
                    return modifiers;
                }
                return undefined;
            };

            if (useDeepgram && deepgramKey && mediaRecorderRef.current) {
                if (mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }

                setTimeout(async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

                    try {
                        const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=fr&smart_format=true&punctuate=true', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Token ${deepgramKey}`,
                                'Content-Type': 'audio/webm'
                            },
                            body: audioBlob
                        });

                        const data = await response.json();
                        const transcript = data.results?.channels[0]?.alternatives[0]?.transcript;

                        if (transcript && transcript.trim().length > 0) {
                            console.log("Deepgram Heard:", transcript);
                            setUserMessage(transcript);
                            const modifiers = buildModifiersFromFaceEmotions();
                            processUserMessage(transcript, modifiers);
                        } else {
                            console.log("Deepgram: No speech detected");
                        }

                        audioChunksRef.current = [];
                        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
                            mediaRecorderRef.current.start();
                        }

                    } catch (e) {
                        console.error("Deepgram API failed", e);
                        const transcript = event.results[event.results.length - 1][0].transcript;
                        setUserMessage(transcript);
                        const modifiers = buildModifiersFromFaceEmotions();
                        processUserMessage(transcript, modifiers);
                    }
                }, 100);

            } else {
                const transcript = event.results[event.results.length - 1][0].transcript;
                console.log("Browser Heard:", transcript);
                setUserMessage(transcript);
                const modifiers = buildModifiersFromFaceEmotions();
                processUserMessage(transcript, modifiers);
            }
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
        };
    }, [setIsListening, setUserMessage, processUserMessage, useHume]);

    useEffect(() => {
        if (useHume) return; // Handled by Hume effect

        if (isPlaying) {
            try {
                recognitionRef.current?.start();
            } catch (e) {
                // Already started
            }
        } else {
            recognitionRef.current?.stop();
            setIsSpeaking(false);
            setIsListening(false);
        }
    }, [isPlaying, setIsSpeaking, setIsListening, useHume]);

    return null;
};
