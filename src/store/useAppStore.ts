import { create } from 'zustand';
import { config } from '../config';
import { DEFAULT_VISUALIZATION_STYLE } from '../utils/falai';
import type { VisualizationStyle } from '../utils/falai';
import type { EnergyStatus } from '../utils/costTracker';
import { getEnergyStatus } from '../utils/costTracker';

// Environment variables for API keys
const env = import.meta.env;

// Energy transaction history entry
export interface EnergyTransaction {
  id: string;
  type: 'consume' | 'add';
  amount: number;
  reason: string;
  timestamp: Date;
  balanceAfter: number;
}

// Visual memory for narrative continuity
export interface VisualConcept {
  keywords: string[];      // Visual elements: ["cats", "garden", "sunlight"]
  mood: string;            // Overall mood: "peaceful and warm"
  palette: string[];       // Color palette: ["soft pink", "golden"]
  setting: string;         // Scene setting: "outdoor garden"
  lastPrompt: string;      // Last generated prompt
  timestamp: Date;         // When this was created
}

interface PoseRotation {
  x: number;
  y: number;
  z: number;
}

interface PoseControls {
  shoulder: PoseRotation;
  upperArm: PoseRotation;
  lowerArm: PoseRotation;
}

interface EyeControls {
  yaw: number;    // horizontal: -90 (right) to +90 (left)
  pitch: number;  // vertical: -45 (down) to +45 (up)
  enabled: boolean; // manual control mode
}

interface AppState {
  isPlaying: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  userMessage: string;
  aiResponse: string;
  error: string | null;
  openAiKey: string;
  mistralKey: string;
  elevenLabsKey: string;
  deepgramKey: string;
  voiceId: string;
  humeApiKey: string;
  humeSecretKey: string;
  humeConfigId: string;
  humeAccessToken: string | null;
  humeFft: number[];
  useHume: boolean;
  chatGroupId: string | null;
  isHumePaused: boolean;
  isSettingsOpen: boolean;
  poseControls: PoseControls;
  eyeControls: EyeControls;
  setEyeControls: (controls: Partial<EyeControls>) => void;
  useElevenLabsAgent: boolean;
  triggeredEmotion: string | null;
  emotionIntensity: number;
  audioAnalyser: AnalyserNode | null;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsSpeaking: (isSpeaking: boolean) => void;
  setIsListening: (isListening: boolean) => void;
  setUserMessage: (message: string) => void;
  setAiResponse: (response: string) => void;
  setError: (error: string | null) => void;
  setKeys: (openAiKey: string, mistralKey: string, elevenLabsKey: string, deepgramKey: string, humeApiKey: string, humeSecretKey: string) => void;
  setVoiceId: (voiceId: string) => void;
  setUseHume: (useHume: boolean) => void;
  setChatGroupId: (id: string | null) => void;
  setIsHumePaused: (isPaused: boolean) => void;
  pauseConversation: () => void;
  resumeConversation: () => void;
  stopConversation: () => void;
  setHumeAccessToken: (token: string | null) => void;
  setHumeFft: (fft: number[]) => void;
  setHumeConfigId: (id: string) => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setPoseRotation: (part: keyof PoseControls, axis: keyof PoseRotation, value: number) => void;
  setUseElevenLabsAgent: (use: boolean) => void;
  triggerEmotion: (emotion: string) => void;
  setEmotionIntensity: (intensity: number) => void;
  setAudioAnalyser: (analyser: AnalyserNode | null) => void;
  // Breathing Settings
  breathingRate: number; // Breaths per minute (default: 12 for relaxed)
  breathingEnabled: boolean;
  setBreathingRate: (rate: number) => void;
  setBreathingEnabled: (enabled: boolean) => void;
  // Lip Sync Settings
  lipSyncSensitivity: number;
  lipSyncSmoothing: number;
  lipSyncNoiseFloor: number;
  lipSyncSibilantThreshold: number;
  lipSyncClosedThreshold: number;
  setLipSyncSettings: (settings: Partial<{ sensitivity: number; smoothing: number; noiseFloor: number; sibilantThreshold: number; closedThreshold: number }>) => void;
  // Conversation History
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string; emotions?: Array<{ name: string; score: number }> }>;
  addToConversationHistory: (role: 'user' | 'assistant', content: string, emotions?: Array<{ name: string; score: number }>) => void;
  clearConversationHistory: () => void;

  showPoseControls: boolean;
  setShowPoseControls: (show: boolean) => void;
  showConversation: boolean;
  setShowConversation: (show: boolean) => void;
  showUserEmotions: boolean;
  setShowUserEmotions: (show: boolean) => void;
  // User's detected emotions from face-api for Resonance System
  userDetectedEmotions: Array<{ name: string; score: number }>;
  setUserDetectedEmotions: (emotions: Array<{ name: string; score: number }>) => void;
  lastAudioBuffer: ArrayBuffer | null;
  setLastAudioBuffer: (buffer: ArrayBuffer | null) => void;
  useDeepgram: boolean;
  setUseDeepgram: (use: boolean) => void;
  // Inner Visualization
  falApiKey: string;
  visualizationEnabled: boolean;
  currentVisualization: string | null;
  visualizationStyle: VisualizationStyle;
  isGeneratingVisualization: boolean;
  isVisualizationSettingsOpen: boolean;
  setFalApiKey: (key: string) => void;
  setVisualizationEnabled: (enabled: boolean) => void;
  setCurrentVisualization: (url: string | null) => void;
  setVisualizationStyle: (style: Partial<VisualizationStyle>) => void;
  setIsGeneratingVisualization: (generating: boolean) => void;
  setIsVisualizationSettingsOpen: (open: boolean) => void;
  // Visualization position and scale (for drag/resize)
  visualizationPosition: { x: number; y: number };
  visualizationScale: number;
  setVisualizationPosition: (pos: { x: number; y: number }) => void;
  setVisualizationScale: (scale: number) => void;
  // Visual Memory for narrative continuity
  visualMemoryConcepts: VisualConcept | null;
  setVisualMemoryConcepts: (concepts: VisualConcept | null) => void;

  // Energy System
  energy: number;
  maxEnergy: number;
  isEnergyModalOpen: boolean;
  energyHistory: EnergyTransaction[];
  energyStatus: EnergyStatus;
  setEnergy: (energy: number) => void;
  consumeEnergy: (amount: number, reason: string) => void;
  addEnergy: (amount: number, source: string) => void;
  setIsEnergyModalOpen: (open: boolean) => void;
  clearEnergyHistory: () => void;

  // Gaze Debug
  gazeDebugEnabled: boolean;
  headRotationOverride: { x: number; y: number; z: number } | null;
  setGazeDebugEnabled: (enabled: boolean) => void;
  setHeadRotationOverride: (rotation: { x: number; y: number; z: number } | null) => void;

  // Model Selection
  currentModel: 'laura' | 'lea';
  setCurrentModel: (model: 'laura' | 'lea') => void;

  // Page Navigation
  currentPage: 'home' | 'expression-measurement';
  setCurrentPage: (page: 'home' | 'expression-measurement') => void;
}

export const useAppStore = create<AppState>((set) => ({
  isPlaying: false,
  isSpeaking: false,
  isListening: false,
  userMessage: '',
  aiResponse: '',
  error: null,
  openAiKey: localStorage.getItem('laura_openai_key') || '',
  mistralKey: localStorage.getItem('laura_mistral_key') || config.mistralApiKey || '',
  elevenLabsKey: localStorage.getItem('laura_elevenlabs_key') || config.elevenLabsApiKey || '',
  deepgramKey: localStorage.getItem('laura_deepgram_key') || env.VITE_DEEPGRAM_API_KEY || '',
  voiceId: localStorage.getItem('laura_voice_id') || config.elevenLabsVoiceId || '',
  humeApiKey: localStorage.getItem('laura_hume_api_key') || env.VITE_HUME_API_KEY || '',
  humeSecretKey: localStorage.getItem('laura_hume_secret_key') || env.VITE_HUME_SECRET_KEY || '',
  humeConfigId: localStorage.getItem('laura_hume_config_id') || env.VITE_HUME_CONFIG_ID || '',
  humeAccessToken: null,
  humeFft: [],
  useHume: localStorage.getItem('laura_use_hume') === 'true',
  chatGroupId: localStorage.getItem('laura_chat_group_id') || null,
  isHumePaused: false,
  isSettingsOpen: false,
  useElevenLabsAgent: localStorage.getItem('laura_use_agent') === 'true',
  triggeredEmotion: null,
  emotionIntensity: 1.0,
  audioAnalyser: null,

  // Breathing Settings (default: 12 BPM for relaxed Laura)
  breathingRate: parseFloat(localStorage.getItem('laura_breathing_rate') || '12'),
  breathingEnabled: localStorage.getItem('laura_breathing_enabled') !== 'false',

  // Default Lip Sync Settings
  lipSyncSensitivity: 0.3,
  lipSyncSmoothing: 0.71,
  lipSyncNoiseFloor: 0.02,
  lipSyncSibilantThreshold: 1.2,
  lipSyncClosedThreshold: 0.2,

  // Conversation History for multi-turn chat
  conversationHistory: [],

  lastAudioBuffer: null,

  useDeepgram: localStorage.getItem('laura_use_deepgram') !== 'false', // Default to true if not set

  showPoseControls: localStorage.getItem('laura_show_pose_controls') !== 'false',
  showConversation: localStorage.getItem('laura_show_conversation') !== 'false',
  showUserEmotions: localStorage.getItem('laura_show_user_emotions') !== 'false',
  userDetectedEmotions: [],

  // Inner Visualization State
  falApiKey: localStorage.getItem('laura_fal_api_key') || config.falApiKey || '',
  visualizationEnabled: localStorage.getItem('laura_visualization_enabled') === 'true',
  currentVisualization: null,
  visualizationStyle: JSON.parse(localStorage.getItem('laura_visualization_style') || 'null') || DEFAULT_VISUALIZATION_STYLE,
  isGeneratingVisualization: false,
  isVisualizationSettingsOpen: false,
  visualizationPosition: { x: 50, y: 5 }, // Default: Percentage (above head)
  visualizationScale: 1,
  visualMemoryConcepts: null,

  // Energy System State
  energy: parseInt(localStorage.getItem('laura_energy') || '1000'),
  maxEnergy: 10000,
  isEnergyModalOpen: false,
  energyHistory: JSON.parse(localStorage.getItem('laura_energy_history') || '[]'),
  energyStatus: getEnergyStatus(
    parseInt(localStorage.getItem('laura_energy') || '1000'),
    10000
  ),

  poseControls: {
    shoulder: { x: 0, y: 0, z: 0 },
    upperArm: { x: 0.13, y: 0, z: 1.25 },
    lowerArm: { x: 0, y: 0, z: 0.09 },
  },
  eyeControls: {
    yaw: 0,
    pitch: 0,
    enabled: false,
  },
  setEyeControls: (controls) => set((state) => ({
    eyeControls: { ...state.eyeControls, ...controls }
  })),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
  setIsListening: (isListening) => set({ isListening }),
  setUserMessage: (userMessage) => set({ userMessage }),
  setAiResponse: (aiResponse) => set({ aiResponse }),
  setError: (error) => set({ error }),
  setKeys: (openAiKey, mistralKey, elevenLabsKey, deepgramKey, humeApiKey, humeSecretKey) => {
    localStorage.setItem('laura_openai_key', openAiKey);
    localStorage.setItem('laura_mistral_key', mistralKey);
    localStorage.setItem('laura_elevenlabs_key', elevenLabsKey);
    localStorage.setItem('laura_deepgram_key', deepgramKey);
    localStorage.setItem('laura_hume_api_key', humeApiKey);
    localStorage.setItem('laura_hume_secret_key', humeSecretKey);
    set({ openAiKey, mistralKey, elevenLabsKey, deepgramKey, humeApiKey, humeSecretKey });
  },
  setUseHume: (useHume) => {
    localStorage.setItem('laura_use_hume', String(useHume));
    set({ useHume });
  },
  setChatGroupId: (chatGroupId) => {
    if (chatGroupId) {
      localStorage.setItem('laura_chat_group_id', chatGroupId);
      localStorage.setItem('laura_session_timestamp', new Date().toISOString());
    } else {
      localStorage.removeItem('laura_chat_group_id');
      localStorage.removeItem('laura_session_timestamp');
    }
    set({ chatGroupId });
  },
  setIsHumePaused: (isHumePaused) => set({ isHumePaused }),
  pauseConversation: () => set({ isHumePaused: true }),
  resumeConversation: () => set({ isHumePaused: false }),
  stopConversation: () => {
    set({ isPlaying: false, isHumePaused: false });
  },
  setHumeAccessToken: (humeAccessToken) => set({ humeAccessToken }),
  setHumeFft: (humeFft) => set({ humeFft }),
  setHumeConfigId: (humeConfigId) => {
    localStorage.setItem('laura_hume_config_id', humeConfigId);
    set({ humeConfigId });
  },
  setVoiceId: (voiceId) => {
    localStorage.setItem('laura_voice_id', voiceId);
    set({ voiceId });
  },
  setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
  setPoseRotation: (part, axis, value) =>
    set((state) => ({
      poseControls: {
        ...state.poseControls,
        [part]: {
          ...state.poseControls[part],
          [axis]: value,
        },
      },
    })),
  setUseElevenLabsAgent: (useElevenLabsAgent) => {
    localStorage.setItem('laura_use_agent', String(useElevenLabsAgent));
    set({ useElevenLabsAgent });
  },
  triggerEmotion: (emotion) => set({ triggeredEmotion: emotion }),
  setEmotionIntensity: (intensity) => set({ emotionIntensity: intensity }),
  setAudioAnalyser: (audioAnalyser) => set({ audioAnalyser }),
  setBreathingRate: (breathingRate) => {
    localStorage.setItem('laura_breathing_rate', String(breathingRate));
    set({ breathingRate });
  },
  setBreathingEnabled: (breathingEnabled) => {
    localStorage.setItem('laura_breathing_enabled', String(breathingEnabled));
    set({ breathingEnabled });
  },
  setLipSyncSettings: (settings) => set((state) => ({
    lipSyncSensitivity: settings.sensitivity ?? state.lipSyncSensitivity,
    lipSyncSmoothing: settings.smoothing ?? state.lipSyncSmoothing,
    lipSyncNoiseFloor: settings.noiseFloor ?? state.lipSyncNoiseFloor,
    lipSyncSibilantThreshold: settings.sibilantThreshold ?? state.lipSyncSibilantThreshold,
    lipSyncClosedThreshold: settings.closedThreshold ?? state.lipSyncClosedThreshold
  })),
  addToConversationHistory: (role, content, emotions) => set((state) => ({
    conversationHistory: [...state.conversationHistory, { role, content, emotions }]
  })),
  clearConversationHistory: () => set({ conversationHistory: [] }),
  setLastAudioBuffer: (lastAudioBuffer) => set({ lastAudioBuffer }),
  setUseDeepgram: (useDeepgram) => {
    localStorage.setItem('laura_use_deepgram', String(useDeepgram));
    set({ useDeepgram });
  },
  setShowPoseControls: (showPoseControls) => {
    localStorage.setItem('laura_show_pose_controls', String(showPoseControls));
    set({ showPoseControls });
  },
  setShowConversation: (showConversation) => {
    localStorage.setItem('laura_show_conversation', String(showConversation));
    set({ showConversation });
  },
  setShowUserEmotions: (showUserEmotions) => {
    localStorage.setItem('laura_show_user_emotions', String(showUserEmotions));
    set({ showUserEmotions });
  },
  setUserDetectedEmotions: (userDetectedEmotions) => set({ userDetectedEmotions }),
  // Inner Visualization Functions
  setFalApiKey: (falApiKey) => {
    localStorage.setItem('laura_fal_api_key', falApiKey);
    set({ falApiKey });
  },
  setVisualizationEnabled: (visualizationEnabled) => {
    localStorage.setItem('laura_visualization_enabled', String(visualizationEnabled));
    set({ visualizationEnabled });
  },
  setCurrentVisualization: (currentVisualization) => set({ currentVisualization }),
  setVisualizationStyle: (style) => set((state) => {
    const newStyle = { ...state.visualizationStyle, ...style };
    localStorage.setItem('laura_visualization_style', JSON.stringify(newStyle));
    return { visualizationStyle: newStyle };
  }),
  setIsGeneratingVisualization: (isGeneratingVisualization) => set({ isGeneratingVisualization }),
  setIsVisualizationSettingsOpen: (isVisualizationSettingsOpen) => set({ isVisualizationSettingsOpen }),
  setVisualizationPosition: (visualizationPosition) => set({ visualizationPosition }),
  setVisualizationScale: (visualizationScale) => set({ visualizationScale }),
  setVisualMemoryConcepts: (visualMemoryConcepts) => set({ visualMemoryConcepts }),

  // Energy System Actions
  setEnergy: (energy) => {
    const clampedEnergy = Math.max(0, Math.min(energy, 10000));
    localStorage.setItem('laura_energy', String(clampedEnergy));
    set((state) => ({
      energy: clampedEnergy,
      energyStatus: getEnergyStatus(clampedEnergy, state.maxEnergy)
    }));
  },
  consumeEnergy: (amount, reason) => set((state) => {
    const newEnergy = Math.max(0, state.energy - amount);
    const transaction: EnergyTransaction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'consume',
      amount,
      reason,
      timestamp: new Date(),
      balanceAfter: newEnergy,
    };
    const newHistory = [...state.energyHistory.slice(-99), transaction]; // Keep last 100
    localStorage.setItem('laura_energy', String(newEnergy));
    localStorage.setItem('laura_energy_history', JSON.stringify(newHistory));
    return {
      energy: newEnergy,
      energyHistory: newHistory,
      energyStatus: getEnergyStatus(newEnergy, state.maxEnergy)
    };
  }),
  addEnergy: (amount, source) => set((state) => {
    const newEnergy = Math.min(state.maxEnergy, state.energy + amount);
    const transaction: EnergyTransaction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'add',
      amount,
      reason: source,
      timestamp: new Date(),
      balanceAfter: newEnergy,
    };
    const newHistory = [...state.energyHistory.slice(-99), transaction];
    localStorage.setItem('laura_energy', String(newEnergy));
    localStorage.setItem('laura_energy_history', JSON.stringify(newHistory));
    return {
      energy: newEnergy,
      energyHistory: newHistory,
      energyStatus: getEnergyStatus(newEnergy, state.maxEnergy)
    };
  }),
  setIsEnergyModalOpen: (isEnergyModalOpen) => set({ isEnergyModalOpen }),
  clearEnergyHistory: () => {
    localStorage.removeItem('laura_energy_history');
    set({ energyHistory: [] });
  },

  // Gaze Debug
  gazeDebugEnabled: false,
  headRotationOverride: null,
  setGazeDebugEnabled: (gazeDebugEnabled) => set({ gazeDebugEnabled }),
  setHeadRotationOverride: (headRotationOverride) => set({ headRotationOverride }),

  // Model Selection
  currentModel: (localStorage.getItem('laura_current_model') as 'laura' | 'lea') || 'laura',
  setCurrentModel: (currentModel) => {
    localStorage.setItem('laura_current_model', currentModel);
    // Reset SpringBone initialization flag when model changes
    (window as any).__springBoneInitialized = false;
    set({ currentModel });
  },

  // Page Navigation
  currentPage: 'home',
  setCurrentPage: (currentPage) => set({ currentPage }),
}));
