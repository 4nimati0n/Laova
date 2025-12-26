import { useEffect, useState, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { MathUtils, Vector3 } from 'three';
import { blendHumeEmotionsToVrmTuned } from '../utils/humeToVrmMapping';
import type { EmotionTuningParams } from '../utils/emotionTuning';
import { DEFAULT_TUNING } from '../utils/emotionTuning';
import type { CompassionParams } from '../utils/compassionMapping';
import { DEFAULT_COMPASSION, computeCompassionateResponse } from '../utils/compassionMapping';

interface EmotionScore {
    name: string;
    score: number;
}

interface EmpathicAvatarProps {
    emotions: EmotionScore[];
    tuningParams?: EmotionTuningParams;
    compassionParams?: CompassionParams;
    onExpressionsChange?: (expressions: Record<string, number>) => void;
    onRawExpressionsChange?: (expressions: Record<string, number>) => void;
}

export const EmpathicAvatar = ({ emotions, tuningParams, compassionParams, onExpressionsChange, onRawExpressionsChange }: EmpathicAvatarProps) => {
    const [vrm, setVrm] = useState<VRM | null>(null);
    const { camera } = useThree();

    // Use provided tuning or defaults
    const activeTuning = tuningParams || DEFAULT_TUNING;
    const activeCompassion = compassionParams || DEFAULT_COMPASSION;

    // Store current expression values for smooth lerping
    const currentExpressionsRef = useRef<Record<string, number>>({
        happy: 0,
        angry: 0,
        sad: 0,
        surprised: 0,
        fun: 0,
        neutral: 0,
    });

    // Track velocity for momentum-based transitions
    const velocityRef = useRef<Record<string, number>>({
        happy: 0,
        angry: 0,
        sad: 0,
        surprised: 0,
        fun: 0,
        neutral: 0,
    });

    // Track last reported values to avoid unnecessary updates
    const lastReportedRef = useRef<string>('');
    const lastRawReportedRef = useRef<string>('');

    // Create loader once
    const loader = useMemo(() => {
        const l = new GLTFLoader();
        l.register((parser) => new VRMLoaderPlugin(parser));
        return l;
    }, []);

    // Load Sarra VRM
    useEffect(() => {
        console.log('🔄 Loading Sarra.vrm for Empathic Mirror');

        loader.loadAsync('/Sarra.vrm').then((gltf) => {
            const vrmInstance = gltf.userData.vrm;
            VRMUtils.removeUnnecessaryVertices(gltf.scene);
            VRMUtils.combineSkeletons(gltf.scene);
            // Sarra is already oriented correctly, no rotation needed
            // vrmInstance.scene.rotation.y = Math.PI;

            // Log available expressions
            if (vrmInstance.expressionManager) {
                const expressions = Object.keys(vrmInstance.expressionManager.expressionMap);
                console.log('🎭 Sarra Expressions:', expressions);
            }

            setVrm(vrmInstance);
        }).catch((error) => {
            console.error('❌ Failed to load Sarra:', error);
        });

        return () => {
            if (vrm) {
                vrm.scene.removeFromParent();
                VRMUtils.deepDispose(vrm.scene);
            }
        };
    }, [loader]);

    useFrame((state, delta) => {
        if (!vrm) return;

        // Update VRM
        vrm.update(delta);

        // === APPLY EMOTIONS with TUNING ===
        const rawVrmExpressions = blendHumeEmotionsToVrmTuned(emotions, activeTuning);

        // === APPLY COMPASSIONATE RESPONSE ===
        // Transform raw empathy into compassionate blend based on mode
        const targetExpressions = computeCompassionateResponse(
            rawVrmExpressions,
            emotions,
            activeCompassion
        );

        // Apply expressions with SPRING PHYSICS
        // Springs naturally provide ease-in-out with smooth acceleration/deceleration
        const expressionNames = ['happy', 'angry', 'sad', 'surprised', 'fun', 'neutral'];
        const { inertiaRise, inertiaFall, easePower, momentum } = activeTuning;

        // Report raw (pre-compassion) expression values for debug
        const rawJSON = JSON.stringify(rawVrmExpressions);
        if (onRawExpressionsChange && rawJSON !== lastRawReportedRef.current) {
            lastRawReportedRef.current = rawJSON;
            onRawExpressionsChange({ ...rawVrmExpressions });
        }

        for (const name of expressionNames) {
            const key = name as 'happy' | 'angry' | 'sad' | 'surprised' | 'fun' | 'neutral';
            const current = currentExpressionsRef.current[name] || 0;
            const target = targetExpressions[key] || 0;
            let velocity = velocityRef.current[name] || 0;

            // Asymmetric spring stiffness: faster rise, slower fall
            const direction = target - current;
            let stiffness: number;
            if (direction > 0) {
                stiffness = inertiaRise * 4; // Spring stiffness for rising
            } else {
                stiffness = inertiaFall * 4; // Spring stiffness for falling
            }

            // Damping controls ease-in-out strength (higher = more damping = smoother)
            // easePower 0 = very damped (smooth), easePower 1 = less damped (snappier)
            const damping = 4 + (1 - easePower) * 8; // Range: 4-12

            // Momentum affects how much we resist direction changes
            // Higher momentum = velocity persists longer
            const momentumFactor = 1 - momentum * 0.8; // Range: 0.2-1.0

            // Spring physics: F = -k*x - c*v
            // a = F/m (mass = 1)
            const displacement = current - target;
            const springForce = -stiffness * displacement;
            const dampingForce = -damping * velocity * momentumFactor;
            const acceleration = springForce + dampingForce;

            // Integrate velocity and position
            velocity += acceleration * delta;
            let next = current + velocity * delta;

            // Clamp to valid range
            next = Math.max(0, Math.min(1, next));

            // If very close to target and moving slow, snap to target
            if (Math.abs(next - target) < 0.001 && Math.abs(velocity) < 0.01) {
                next = target;
                velocity = 0;
            }

            velocityRef.current[name] = velocity;
            currentExpressionsRef.current[name] = next;

            // Try different VRM expression name variants
            const variants = [name, name.charAt(0).toUpperCase() + name.slice(1)];
            if (name === 'happy') variants.push('joy', 'Joy');
            if (name === 'sad') variants.push('sorrow', 'Sorrow');

            for (const variant of variants) {
                vrm.expressionManager?.setValue(variant, next);
            }
        }

        // Report current expression values to parent (throttled)
        const currentJSON = JSON.stringify(currentExpressionsRef.current);
        if (onExpressionsChange && currentJSON !== lastReportedRef.current) {
            lastReportedRef.current = currentJSON;
            onExpressionsChange({ ...currentExpressionsRef.current });
        }

        // === NATURAL BLINKING ===
        const blinkCycle = state.clock.elapsedTime % 3.5;
        const blinkDuration = 0.15;
        if (blinkCycle < blinkDuration) {
            const blinkProgress = blinkCycle / blinkDuration;
            const blinkValue = Math.sin(blinkProgress * Math.PI);
            vrm.expressionManager?.setValue('blink', blinkValue);
        } else {
            vrm.expressionManager?.setValue('blink', 0);
        }

        // === BREATHING ===
        const chest = vrm.humanoid.getNormalizedBoneNode('chest');
        if (chest) {
            const breathFrequency = 0.2; // ~12 breaths per minute
            const breathValue = Math.sin(state.clock.elapsedTime * Math.PI * 2 * breathFrequency);
            chest.rotation.x = breathValue * 0.015;
        }

        // === IDLE MICRO-MOVEMENTS ===
        const time = state.clock.elapsedTime;
        const hips = vrm.humanoid.getNormalizedBoneNode('hips');
        const spine = vrm.humanoid.getNormalizedBoneNode('spine');

        if (hips) {
            const swayX = Math.sin(time * 0.23) * 0.003;
            const swayZ = Math.sin(time * 0.19) * 0.002;
            hips.rotation.x = MathUtils.lerp(hips.rotation.x, swayX, 0.02);
            hips.rotation.z = MathUtils.lerp(hips.rotation.z, swayZ, 0.02);
        }

        if (spine) {
            const swayX = Math.sin(time * 0.17) * 0.002;
            spine.rotation.x = MathUtils.lerp(spine.rotation.x, swayX, 0.015);
        }

        // === GAZE - Look at camera center ===
        const head = vrm.humanoid.getNormalizedBoneNode('head');
        const neck = vrm.humanoid.getNormalizedBoneNode('neck') || head?.parent;

        if (head && neck) {
            // Look at center of screen (camera position)
            const cameraPos = camera.position.clone();
            const headWorldPos = head.getWorldPosition(new Vector3());

            // Direction from head to camera
            const dirToCamera = cameraPos.clone().sub(headWorldPos).normalize();

            // Calculate yaw and pitch for non-rotated model
            // Model faces +Z, so we calculate angles accordingly
            const yaw = Math.atan2(dirToCamera.x, dirToCamera.z) * 0.5;
            const pitch = Math.asin(MathUtils.clamp(dirToCamera.y, -1, 1)) * 0.5;

            // Smooth application
            head.rotation.y = MathUtils.lerp(head.rotation.y, yaw, 0.05);
            head.rotation.x = MathUtils.lerp(head.rotation.x, pitch, 0.05);
        }
    });

    return vrm ? <primitive object={vrm.scene} /> : null;
};
