// Fal AI Flux.1 Schnell integration for Laura's inner visualization
// Uses the fast Flux.1 Schnell model for real-time visualization generation

import { useAppStore } from '../store/useAppStore';

// Display mode type
export type VisualizationDisplayMode = 'above_head' | 'fullscreen';

// Visualization style based on Laura's personality
export interface VisualizationStyle {
    dreaminess: number;      // 0-1: blur/soft focus level
    warmth: number;          // 0-1: warm vs cool color temperature
    saturation: number;      // 0-1: color intensity
    animeLevel: number;      // 0-1: anime vs realistic style
    displayMode: VisualizationDisplayMode;  // Where to display the visualization
}

export const DEFAULT_VISUALIZATION_STYLE: VisualizationStyle = {
    dreaminess: 0.7,
    warmth: 0.6,
    saturation: 0.5,
    animeLevel: 0.8,
    displayMode: 'above_head'  // Default: show above Laura's head
};

// Laura's base style modifiers (her personality-based aesthetic)
const LAURA_STYLE_BASE = `soft anime aesthetic, gentle watercolor textures, dreamy atmosphere, whimsical mood`;

// Build style string from settings + Laura's personality
export const buildStyleString = (style: VisualizationStyle): string => {
    const styleModifiers: string[] = [LAURA_STYLE_BASE];

    // Dreaminess affects blur and softness
    if (style.dreaminess > 0.5) {
        styleModifiers.push('ethereal glow', 'soft bokeh');
    }
    if (style.dreaminess > 0.7) {
        styleModifiers.push('dreamlike haze');
    }

    // Warmth affects color palette
    if (style.warmth > 0.6) {
        styleModifiers.push('warm golden tones', 'soft pink accents');
    } else if (style.warmth < 0.4) {
        styleModifiers.push('cool blue tones', 'gentle lavender');
    } else {
        styleModifiers.push('balanced warm pastels');
    }

    // Saturation
    if (style.saturation > 0.6) {
        styleModifiers.push('vibrant colors');
    } else if (style.saturation < 0.4) {
        styleModifiers.push('muted soft colors');
    } else {
        styleModifiers.push('gentle pastel palette');
    }

    // Anime level
    if (style.animeLevel > 0.7) {
        styleModifiers.push('anime art style', 'manga-inspired');
    } else if (style.animeLevel > 0.4) {
        styleModifiers.push('semi-realistic anime style');
    }

    return styleModifiers.join(', ');
};

// Image size presets (Fal AI supported sizes)
export type ImageSize = 'square' | 'landscape_4_3' | 'portrait_4_3' | 'landscape_16_9' | 'portrait_16_9';

// Calculate optimal image dimensions based on display mode and bubble size
// Fal AI requirements: max 1536x1536, dimensions must be multiples of 32
export const getOptimalImageSize = (
    displayMode: VisualizationDisplayMode,
    bubbleScale: number = 1
): { width: number; height: number } => {
    // Get device pixel ratio for retina displays
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance

    if (displayMode === 'fullscreen') {
        // Use actual screen pixels for full quality
        let targetWidth = window.innerWidth * dpr;
        let targetHeight = window.innerHeight * dpr;

        // Scale down to fit within 1536x1536 while preserving aspect ratio
        const maxDimension = 1536;
        if (targetWidth > maxDimension || targetHeight > maxDimension) {
            const scale = Math.min(maxDimension / targetWidth, maxDimension / targetHeight);
            targetWidth *= scale;
            targetHeight *= scale;
        }

        // Round to nearest 32 (Fal AI requirement)
        const width = Math.round(targetWidth / 32) * 32;
        const height = Math.round(targetHeight / 32) * 32;

        console.log(`📐 Fullscreen: screen=${window.innerWidth}x${window.innerHeight}, dpr=${dpr}, target=${targetWidth}x${targetHeight}, final=${width}x${height}`);
        return { width, height };
    } else {
        // above_head: Calculate based on actual bubble size in pixels
        // Default bubble is 300px, scale affects it
        const bubblePixels = 300 * bubbleScale * dpr;
        // Round to 32 and cap at 1536 (allow high quality for large bubbles)
        const size = Math.min(Math.round(bubblePixels / 32) * 32, 1536);
        const finalSize = Math.max(256, size); // Minimum 256
        console.log(`📐 Bubble: scale=${bubbleScale}, pixels=${bubblePixels}, final=${finalSize}x${finalSize}`);
        return { width: finalSize, height: finalSize };
    }
};

export interface FalAIRequest {
    prompt: string;
    image_size?: ImageSize;
    width?: number;
    height?: number;
    num_inference_steps?: number;
    guidance_scale?: number;
    num_images?: number;
    enable_safety_checker?: boolean;
    output_format?: 'jpeg' | 'png';
}

export interface FalAIResponse {
    images: Array<{
        url: string;
        content_type: string;
        width?: number;
        height?: number;
    }>;
    seed: number;
    prompt: string;
    timings?: {
        inference: number;
    };
}

/**
 * Generate a visualization using Fal AI Flux.1 Schnell
 * @param visualPrompt The visual prompt describing what to generate
 * @param style Optional style overrides
 * @returns URL of the generated image
 */
export const generateVisualization = async (
    visualPrompt: string,
    style?: Partial<VisualizationStyle>
): Promise<string> => {
    const { falApiKey, visualizationStyle } = useAppStore.getState();

    if (!falApiKey) {
        throw new Error("Fal AI API key is missing. Please add it in Settings.");
    }

    // Merge with default style
    const finalStyle: VisualizationStyle = {
        ...DEFAULT_VISUALIZATION_STYLE,
        ...visualizationStyle,
        ...style
    };

    // Build the complete prompt with Laura's style
    const styleString = buildStyleString(finalStyle);
    const fullPrompt = `${visualPrompt}, ${styleString}`;

    console.log('🎨 Generating visualization:', fullPrompt);

    // Get optimal image size based on display mode and scale
    const { visualizationScale } = useAppStore.getState();
    const dimensions = getOptimalImageSize(finalStyle.displayMode, visualizationScale);

    console.log('📐 Image dimensions:', dimensions);

    const request: FalAIRequest = {
        prompt: fullPrompt,
        width: dimensions.width,
        height: dimensions.height,
        num_inference_steps: 4, // Schnell is optimized for 4 steps
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
        output_format: 'jpeg'
    };

    try {
        const response = await fetch('https://fal.run/fal-ai/flux-1/schnell', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Key ${falApiKey}`
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Fal AI Error:', response.status, errorText);
            throw new Error(`Fal AI API error: ${response.status}`);
        }

        const data: FalAIResponse = await response.json();

        if (!data.images || data.images.length === 0) {
            throw new Error('No image generated');
        }

        console.log('✨ Visualization generated:', data.images[0].url);
        console.log('⏱️ Generation time:', data.timings?.inference, 'ms');

        return data.images[0].url;
    } catch (error: any) {
        console.error('Fal AI Error:', error);
        throw error;
    }
};
