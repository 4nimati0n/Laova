/**
 * Face Detection Hook using face-api.js
 * 
 * FREE local emotion detection - replaces expensive Hume API
 * Detects: happy, sad, angry, fearful, disgusted, surprised, neutral
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';

export interface EmotionScore {
    name: string;
    score: number;
}

interface UseFaceDetectionOptions {
    /** Detection interval in ms (default: 200) */
    interval?: number;
    /** Minimum confidence threshold (default: 0.1) */
    minConfidence?: number;
}

interface UseFaceDetectionReturn {
    /** Whether models are loaded */
    isReady: boolean;
    /** Whether detection is running */
    isDetecting: boolean;
    /** Current detected emotions (sorted by score) */
    emotions: EmotionScore[];
    /** Error message if any */
    error: string | null;
    /** Start detection on a video element */
    startDetection: (video: HTMLVideoElement) => void;
    /** Stop detection */
    stopDetection: () => void;
}

// Map face-api expressions to Hume-like emotion names for compatibility
const EXPRESSION_MAP: Record<string, string> = {
    happy: 'Joy',
    sad: 'Sadness',
    angry: 'Anger',
    fearful: 'Fear',
    disgusted: 'Disgust',
    surprised: 'Surprise',
    neutral: 'Calmness',
};

// Additional synthetic emotions derived from combinations
const deriveSyntheticEmotions = (expressions: faceapi.FaceExpressions): EmotionScore[] => {
    const base: EmotionScore[] = [];

    // Map base emotions
    for (const [expr, humeName] of Object.entries(EXPRESSION_MAP)) {
        const score = (expressions as any)[expr] || 0;
        base.push({ name: humeName, score });
    }

    // Add some derived emotions for richer expression
    const happy = expressions.happy || 0;
    const surprised = expressions.surprised || 0;
    const sad = expressions.sad || 0;
    const fearful = expressions.fearful || 0;

    // Excitement = happy + surprised
    base.push({ name: 'Excitement', score: Math.min(1, (happy + surprised) * 0.6) });

    // Interest = slight surprise + low fear
    base.push({ name: 'Interest', score: Math.min(1, surprised * 0.5 + (1 - fearful) * 0.2) });

    // Contentment = happy with low arousal
    base.push({ name: 'Contentment', score: Math.min(1, happy * 0.7 + (1 - surprised) * 0.2) });

    // Anxiety = fear + sad
    base.push({ name: 'Anxiety', score: Math.min(1, (fearful + sad) * 0.5) });

    // Concentration = neutral with some engagement
    const neutral = expressions.neutral || 0;
    base.push({ name: 'Concentration', score: neutral * 0.8 });

    return base;
};

export const useFaceDetection = (options: UseFaceDetectionOptions = {}): UseFaceDetectionReturn => {
    const { interval = 200, minConfidence = 0.1 } = options;

    const [isReady, setIsReady] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [emotions, setEmotions] = useState<EmotionScore[]>([]);
    const [error, setError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const intervalRef = useRef<number | null>(null);
    const isLoadingRef = useRef(false);

    // Load face-api models on mount
    useEffect(() => {
        const loadModels = async () => {
            if (isLoadingRef.current || isReady) return;
            isLoadingRef.current = true;

            try {
                const MODEL_URL = '/models/face-api';

                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                ]);

                console.log('✅ face-api.js models loaded (FREE emotion detection)');
                setIsReady(true);
                setError(null);
            } catch (err) {
                console.error('Failed to load face-api models:', err);
                setError('Échec du chargement des modèles de détection faciale');
            } finally {
                isLoadingRef.current = false;
            }
        };

        loadModels();
    }, [isReady]);

    // Detection loop
    const runDetection = useCallback(async () => {
        if (!videoRef.current || !isReady) return;

        const video = videoRef.current;
        if (video.readyState !== 4) return;

        try {
            const detection = await faceapi
                .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();

            if (detection?.expressions) {
                const allEmotions = deriveSyntheticEmotions(detection.expressions);

                // Filter by confidence and sort
                const filtered = allEmotions
                    .filter(e => e.score >= minConfidence)
                    .sort((a, b) => b.score - a.score);

                setEmotions(filtered);
            }
        } catch (err) {
            // Silent fail for detection errors (common during video init)
        }
    }, [isReady, minConfidence]);

    const startDetection = useCallback((video: HTMLVideoElement) => {
        if (!isReady) {
            console.warn('face-api models not yet loaded');
            return;
        }

        videoRef.current = video;
        setIsDetecting(true);

        // Start detection loop
        intervalRef.current = window.setInterval(runDetection, interval);
        console.log(`🎯 Started FREE emotion detection (${1000 / interval}fps)`);
    }, [isReady, interval, runDetection]);

    const stopDetection = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsDetecting(false);
        setEmotions([]);
        videoRef.current = null;
        console.log('⏹️ Stopped emotion detection');
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return {
        isReady,
        isDetecting,
        emotions,
        error,
        startDetection,
        stopDetection,
    };
};
