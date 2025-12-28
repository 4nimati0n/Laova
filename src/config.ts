// Configuration file for API keys
// Keys are now loaded from environment variables for security
// See .env.example for the list of required variables

const env = import.meta.env;

export const config = {
    // Mistral AI API Key
    mistralApiKey: env.VITE_MISTRAL_API_KEY || '',

    // ElevenLabs Configuration
    elevenLabsApiKey: env.VITE_ELEVENLABS_API_KEY || '',
    elevenLabsVoiceId: env.VITE_ELEVENLABS_VOICE_ID || '',

    // Fal AI Configuration (for visualization generation)
    falApiKey: env.VITE_FAL_API_KEY || '',
};
