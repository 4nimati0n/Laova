import { VoiceProvider } from '@humeai/voice-react';
import { useAppStore } from '../store/useAppStore';
import { useEffect, type ReactNode } from 'react';

interface HumeProviderProps {
    children: ReactNode;
}

export const HumeProvider = ({ children }: HumeProviderProps) => {
    const { humeApiKey, humeSecretKey, useHume, setHumeAccessToken, humeAccessToken, humeConfigId } = useAppStore();

    useEffect(() => {
        const fetchAccessToken = async () => {
            if (!humeApiKey || !humeSecretKey || !useHume) {
                setHumeAccessToken(null);
                return;
            }

            try {
                const response = await fetch('https://api.hume.ai/oauth2-cc/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${btoa(`${humeApiKey}:${humeSecretKey}`)}`
                    },
                    body: new URLSearchParams({
                        grant_type: 'client_credentials'
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch Hume access token');
                }

                const data = await response.json();
                setHumeAccessToken(data.access_token);
                console.log('✅ Hume AI access token obtained successfully');
            } catch (error) {
                console.error('Error fetching Hume access token:', error);
                setHumeAccessToken(null);
            }
        };

        fetchAccessToken();
    }, [humeApiKey, humeSecretKey, useHume, setHumeAccessToken]);

    // Only provide auth when we have a valid access token
    const authConfig = humeAccessToken
        ? { type: 'accessToken' as const, value: humeAccessToken }
        : undefined;

    return (
        // @ts-ignore - Hume API signature change workaround
        <VoiceProvider
            auth={authConfig}
            configId={humeConfigId || undefined}
        >
            {children}
        </VoiceProvider>
    );
};
