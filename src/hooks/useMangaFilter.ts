/**
 * Advanced Manga Filter Hook
 * 
 * Provides 6 manga/anime style filters with adjustable parameters:
 * 1. CSS Manga - contrast, saturation, brightness, hue
 * 2. Cel-Shading - posterization levels, edge threshold, edge width
 * 3. Halftone - dot size, density, angle (classic manga screen tones)
 * 4. Color Boost - intensity, selective color boosting
 * 5. Vignette - intensity, radius, softness
 * 6. Paper Grain - intensity, size, contrast
 */

import { useState, useRef, useEffect, useCallback } from 'react';

// Filter state and parameters
export interface MangaFilters {
    cssManga: {
        enabled: boolean;
        contrast: number;      // 1.0 - 2.5
        saturation: number;    // 0.8 - 2.0
        brightness: number;    // 0.8 - 1.3
        hueRotate: number;     // -20 to +20 degrees
    };
    celShading: {
        enabled: boolean;
        posterizeLevels: number;   // 3-12
        edgeThreshold: number;     // 0.05 - 0.4
        edgeWidth: number;         // 0.3 - 2.0
    };
    halftone: {
        enabled: boolean;
        dotSize: number;      // 2-10
        density: number;      // 0.5 - 1.5
        angle: number;        // 0-90 degrees
    };
    colorBoost: {
        enabled: boolean;
        intensity: number;    // 1.0 - 2.5
        pinkBoost: number;    // 0-2
        blueBoost: number;    // 0-2
    };
    vignette: {
        enabled: boolean;
        intensity: number;    // 0 - 1
        radius: number;       // 0.3 - 1.0
        softness: number;     // 0.1 - 0.8
    };
    paperGrain: {
        enabled: boolean;
        intensity: number;    // 0 - 0.3
        size: number;         // 1-5
        contrast: number;     // 0.5 - 2.0
    };
}

// Default parameters
export const DEFAULT_MANGA_FILTERS: MangaFilters = {
    cssManga: {
        enabled: false,
        contrast: 1.4,
        saturation: 1.3,
        brightness: 1.05,
        hueRotate: -5,
    },
    celShading: {
        enabled: false,
        posterizeLevels: 6,
        edgeThreshold: 0.15,
        edgeWidth: 0.8,
    },
    halftone: {
        enabled: false,
        dotSize: 4,
        density: 1.0,
        angle: 45,
    },
    colorBoost: {
        enabled: false,
        intensity: 1.5,
        pinkBoost: 1.3,
        blueBoost: 1.2,
    },
    vignette: {
        enabled: false,
        intensity: 0.5,
        radius: 0.7,
        softness: 0.4,
    },
    paperGrain: {
        enabled: false,
        intensity: 0.15,
        size: 2,
        contrast: 1.2,
    },
};

interface UseMangaFilterReturn {
    filters: MangaFilters;
    updateFilter: <K extends keyof MangaFilters>(
        filterName: K,
        updates: Partial<MangaFilters[K]>
    ) => void;
    cssFilterStyle: string;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    startRendering: (video: HTMLVideoElement) => void;
    stopRendering: () => void;
}

// Combined WebGL shader with all effects
const VERTEX_SHADER = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
    }
`;

const FRAGMENT_SHADER = `
    precision mediump float;
    uniform sampler2D u_image;
    uniform vec2 u_resolution;
    varying vec2 v_texCoord;
    
    // Cel-shading uniforms
    uniform bool u_celShadingEnabled;
    uniform float u_posterizeLevels;
    uniform float u_edgeThreshold;
    uniform float u_edgeWidth;
    
    // Halftone uniforms
    uniform bool u_halftoneEnabled;
    uniform float u_dotSize;
    uniform float u_density;
    uniform float u_angle;
    
    // Color boost uniforms
    uniform bool u_colorBoostEnabled;
    uniform float u_boostIntensity;
    uniform float u_pinkBoost;
    uniform float u_blueBoost;
    
    // Vignette uniforms
    uniform bool u_vignetteEnabled;
    uniform float u_vignetteIntensity;
    uniform float u_vignetteRadius;
    uniform float u_vignetteSoftness;
    
    // Paper grain uniforms
    uniform bool u_paperGrainEnabled;
    uniform float u_grainIntensity;
    uniform float u_grainSize;
    uniform float u_grainContrast;
    
    // Posterize colors
    vec3 posterize(vec3 color, float levels) {
        return floor(color * levels) / levels;
    }
    
    // Edge detection (Laplacian kernel)
    float edgeDetect(vec2 uv, vec2 texelSize) {
        float kernel[9];
        kernel[0] = -1.0; kernel[1] = -1.0; kernel[2] = -1.0;
        kernel[3] = -1.0; kernel[4] =  8.0; kernel[5] = -1.0;
        kernel[6] = -1.0; kernel[7] = -1.0; kernel[8] = -1.0;
        
        vec2 offsets[9];
        offsets[0] = vec2(-1,-1); offsets[1] = vec2(0,-1); offsets[2] = vec2(1,-1);
        offsets[3] = vec2(-1, 0); offsets[4] = vec2(0, 0); offsets[5] = vec2(1, 0);
        offsets[6] = vec2(-1, 1); offsets[7] = vec2(0, 1); offsets[8] = vec2(1, 1);
        
        float edge = 0.0;
        for (int i = 0; i < 9; i++) {
            vec3 sample = texture2D(u_image, uv + offsets[i] * texelSize).rgb;
            float lum = dot(sample, vec3(0.299, 0.587, 0.114));
            edge += lum * kernel[i];
        }
        return abs(edge);
    }
    
    // Pseudo-random function for grain
    float random(vec2 st) {
        return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    // Halftone pattern
    float halftone(vec2 uv, float lum) {
        // Rotate coordinates
        float rad = radians(u_angle);
        mat2 rot = mat2(cos(rad), -sin(rad), sin(rad), cos(rad));
        vec2 rotUV = rot * (uv * u_resolution / u_dotSize);
        
        // Grid cell
        vec2 cell = fract(rotUV);
        vec2 center = vec2(0.5);
        float dist = distance(cell, center);
        
        // Dot radius based on luminance and density
        float radius = sqrt(lum) * 0.5 * u_density;
        return smoothstep(radius - 0.05, radius + 0.05, dist);
    }
    
    void main() {
        vec2 texelSize = 1.0 / u_resolution;
        vec4 color = texture2D(u_image, v_texCoord);
        vec3 result = color.rgb;
        
        // 1. Cel-Shading
        if (u_celShadingEnabled) {
            result = posterize(result, u_posterizeLevels);
            
            float edge = edgeDetect(v_texCoord, texelSize);
            float edgeStrength = smoothstep(u_edgeThreshold, u_edgeThreshold + 0.1, edge);
            result = mix(result, vec3(0.0), edgeStrength * u_edgeWidth);
        }
        
        // 2. Halftone
        if (u_halftoneEnabled) {
            float lum = dot(result, vec3(0.299, 0.587, 0.114));
            float pattern = halftone(v_texCoord, lum);
            result = mix(vec3(0.0), result, pattern);
        }
        
        // 3. Color Boost
        if (u_colorBoostEnabled) {
            // Boost pink/red tones
            float pinkness = max(result.r - (result.g + result.b) * 0.5, 0.0);
            result.r += pinkness * u_pinkBoost * u_boostIntensity;
            
            // Boost blue/cyan tones
            float blueness = max(result.b - (result.r + result.g) * 0.5, 0.0);
            result.b += blueness * u_blueBoost * u_boostIntensity;
            
            // Overall saturation boost
            float gray = dot(result, vec3(0.299, 0.587, 0.114));
            result = mix(vec3(gray), result, u_boostIntensity);
        }
        
        // 4. Vignette
        if (u_vignetteEnabled) {
            vec2 center = vec2(0.5);
            float dist = distance(v_texCoord, center);
            float vignette = smoothstep(u_vignetteRadius, u_vignetteRadius - u_vignetteSoftness, dist);
            result = mix(result * (1.0 - u_vignetteIntensity), result, vignette);
        }
        
        // 5. Paper Grain
        if (u_paperGrainEnabled) {
            vec2 grainCoord = v_texCoord * u_resolution / u_grainSize;
            float noise = random(grainCoord) - 0.5;
            noise *= u_grainIntensity;
            
            // Apply grain with contrast
            result += noise * u_grainContrast;
        }
        
        gl_FragColor = vec4(clamp(result, 0.0, 1.0), color.a);
    }
`;

export const useMangaFilter = (): UseMangaFilterReturn => {
    const [filters, setFilters] = useState<MangaFilters>(DEFAULT_MANGA_FILTERS);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const animationRef = useRef<number | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const textureRef = useRef<WebGLTexture | null>(null);

    // Update specific filter
    const updateFilter = useCallback(<K extends keyof MangaFilters>(
        filterName: K,
        updates: Partial<MangaFilters[K]>
    ) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: { ...prev[filterName], ...updates }
        }));
    }, []);

    // Generate CSS filter string
    const cssFilterStyle = filters.cssManga.enabled
        ? `contrast(${filters.cssManga.contrast}) ` +
        `saturate(${filters.cssManga.saturation}) ` +
        `brightness(${filters.cssManga.brightness}) ` +
        `hue-rotate(${filters.cssManga.hueRotate}deg)`
        : 'none';

    // Initialize WebGL
    const initWebGL = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return false;

        const gl = canvas.getContext('webgl');
        if (!gl) {
            console.error('WebGL not supported');
            return false;
        }
        glRef.current = gl;

        // Compile shaders
        const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
        gl.shaderSource(vertexShader, VERTEX_SHADER);
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(fragmentShader, FRAGMENT_SHADER);
        gl.compileShader(fragmentShader);

        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.error('Fragment shader error:', gl.getShaderInfoLog(fragmentShader));
            return false;
        }

        // Create program
        const program = gl.createProgram()!;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        programRef.current = program;

        // Set up geometry
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, -1, 1, 1
        ]), gl.STATIC_DRAW);

        const positionLoc = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        const texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0, 1, 1, 1, 0, 0,
            0, 0, 1, 1, 1, 0
        ]), gl.STATIC_DRAW);

        const texCoordLoc = gl.getAttribLocation(program, 'a_texCoord');
        gl.enableVertexAttribArray(texCoordLoc);
        gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

        // Create texture
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        textureRef.current = texture;

        return true;
    }, []);

    // Render frame with all active filters
    const renderFrame = useCallback(() => {
        const gl = glRef.current;
        const program = programRef.current;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video) return;

        animationRef.current = requestAnimationFrame(renderFrame);

        if (!gl || !program || !canvas) return;
        if (video.readyState < 2) return;

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        gl.viewport(0, 0, canvas.width, canvas.height);

        // Update texture
        gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

        gl.useProgram(program);

        // Set resolution
        const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
        gl.uniform2f(resolutionLoc, canvas.width, canvas.height);

        // Set all filter uniforms
        const setUniform1i = (name: string, value: boolean) => {
            const loc = gl.getUniformLocation(program, name);
            gl.uniform1i(loc, value ? 1 : 0);
        };
        const setUniform1f = (name: string, value: number) => {
            const loc = gl.getUniformLocation(program, name);
            gl.uniform1f(loc, value);
        };

        // Cel-shading
        setUniform1i('u_celShadingEnabled', filters.celShading.enabled);
        setUniform1f('u_posterizeLevels', filters.celShading.posterizeLevels);
        setUniform1f('u_edgeThreshold', filters.celShading.edgeThreshold);
        setUniform1f('u_edgeWidth', filters.celShading.edgeWidth);

        // Halftone
        setUniform1i('u_halftoneEnabled', filters.halftone.enabled);
        setUniform1f('u_dotSize', filters.halftone.dotSize);
        setUniform1f('u_density', filters.halftone.density);
        setUniform1f('u_angle', filters.halftone.angle);

        // Color boost
        setUniform1i('u_colorBoostEnabled', filters.colorBoost.enabled);
        setUniform1f('u_boostIntensity', filters.colorBoost.intensity);
        setUniform1f('u_pinkBoost', filters.colorBoost.pinkBoost);
        setUniform1f('u_blueBoost', filters.colorBoost.blueBoost);

        // Vignette
        setUniform1i('u_vignetteEnabled', filters.vignette.enabled);
        setUniform1f('u_vignetteIntensity', filters.vignette.intensity);
        setUniform1f('u_vignetteRadius', filters.vignette.radius);
        setUniform1f('u_vignetteSoftness', filters.vignette.softness);

        // Paper grain
        setUniform1i('u_paperGrainEnabled', filters.paperGrain.enabled);
        setUniform1f('u_grainIntensity', filters.paperGrain.intensity);
        setUniform1f('u_grainSize', filters.paperGrain.size);
        setUniform1f('u_grainContrast', filters.paperGrain.contrast);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }, [filters]);

    const startRendering = useCallback((video: HTMLVideoElement) => {
        videoRef.current = video;
        if (initWebGL()) {
            renderFrame();
            console.log('🎨 Manga filters started');
        }
    }, [initWebGL, renderFrame]);

    const stopRendering = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        videoRef.current = null;
        console.log('⏹️ Manga filters stopped');
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return {
        filters,
        updateFilter,
        cssFilterStyle,
        canvasRef,
        startRendering,
        stopRendering,
    };
};
