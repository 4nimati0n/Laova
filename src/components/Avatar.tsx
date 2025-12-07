import { useEffect, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { useAppStore } from '../store/useAppStore';
import { MathUtils, Quaternion, Euler, Vector3 } from 'three';
import { useEmotion } from '../hooks/useEmotion';

export const Avatar = () => {
    const isSpeaking = useAppStore(state => state.isSpeaking);
    const poseControls = useAppStore(state => state.poseControls);
    const triggeredEmotion = useAppStore(state => state.triggeredEmotion);
    const emotionIntensity = useAppStore(state => state.emotionIntensity);

    const [vrm, setVrm] = useState<VRM | null>(null);
    const { updateEmotion, setEmotionWithIntensity } = useEmotion();

    // Load VRM Model
    const gltf = useLoader(GLTFLoader, '/model.vrm', (loader) => {
        loader.register((parser) => {
            return new VRMLoaderPlugin(parser);
        });
    });

    useEffect(() => {
        if (gltf) {
            const vrmInstance = gltf.userData.vrm;
            VRMUtils.removeUnnecessaryVertices(gltf.scene);
            VRMUtils.combineSkeletons(gltf.scene);
            vrmInstance.scene.rotation.y = Math.PI; // Rotate to face camera

            // Log available expressions with their bindings
            if (vrmInstance.expressionManager) {
                const expressions = Object.keys(vrmInstance.expressionManager.expressionMap);
                console.log("Available Expressions:", expressions);

                // Log detailed binding info for each expression
                console.log("🔍 Expression Bindings:");
                expressions.forEach((name: string) => {
                    const expr = vrmInstance.expressionManager.getExpression(name);
                    if (expr) {
                        // Check if it has morph target binds
                        const binds = (expr as any)._binds || (expr as any).binds || [];
                        if (binds.length > 0) {
                            console.log(`  ${name}:`, binds.map((b: any) => ({
                                mesh: b.primitives?.[0]?.name || 'unknown',
                                index: b.index,
                                weight: b.weight
                            })));
                        }
                    }
                });
            }

            // Find the face mesh and add a morph tester
            let faceMesh: any = null;
            vrmInstance.scene.traverse((child: any) => {
                if (child.isMesh && child.morphTargetDictionary) {
                    if (child.name.toLowerCase().includes('face')) {
                        faceMesh = child;
                        console.log(`📋 Face mesh "${child.name}" has ${Object.keys(child.morphTargetDictionary).length} morphs`);
                        console.log("Morph influences array length:", child.morphTargetInfluences?.length);
                    }
                }
            });

            // Store face mesh for morph testing
            if (faceMesh) {
                (window as any).__faceMesh = faceMesh;
                console.log("🎛️ Face mesh stored. Test morphs with: window.__faceMesh.morphTargetInfluences[INDEX] = 1");
                console.log("   Example: window.__faceMesh.morphTargetInfluences[0] = 1");
            }

            setVrm(vrmInstance);
        }
    }, [gltf]);

    // Apply pose from controls
    useEffect(() => {
        if (!vrm) return;

        const applyPose = () => {
            const pose = vrm.humanoid.getNormalizedPose();

            const getRotation = (x: number, y: number, z: number) => {
                return new Quaternion().setFromEuler(new Euler(x, y, z)).toArray() as [number, number, number, number];
            };

            // Apply symmetrical pose (left positive Z, right negative Z)
            const { shoulder, upperArm, lowerArm } = poseControls;

            pose.leftShoulder = { rotation: getRotation(shoulder.x, shoulder.y, shoulder.z) };
            pose.leftUpperArm = { rotation: getRotation(upperArm.x, upperArm.y, upperArm.z) };
            pose.leftLowerArm = { rotation: getRotation(lowerArm.x, lowerArm.y, lowerArm.z) };

            pose.rightShoulder = { rotation: getRotation(shoulder.x, shoulder.y, -shoulder.z) };
            pose.rightUpperArm = { rotation: getRotation(upperArm.x, upperArm.y, -upperArm.z) };
            pose.rightLowerArm = { rotation: getRotation(lowerArm.x, lowerArm.y, -lowerArm.z) };

            vrm.humanoid.setNormalizedPose(pose);
        };

        applyPose();

        // LOG AVAILABLE EXPRESSIONS - Remove after checking
        if (vrm.expressionManager) {
            const expressions = Object.keys(vrm.expressionManager.expressionMap);
            console.log("🎭 Available VRM Expressions:", expressions);
        }
    }, [vrm, poseControls]);

    // Watch for emotion triggers from PoseControls
    useEffect(() => {
        if (triggeredEmotion) {
            setEmotionWithIntensity(triggeredEmotion as any, emotionIntensity);
        }
    }, [triggeredEmotion, emotionIntensity, setEmotionWithIntensity]);

    useFrame((state, delta) => {
        if (vrm) {
            vrm.update(delta);
            updateEmotion(vrm, delta);

            // --- Procedural Animations ---

            // Lip Sync
            const { audioAnalyser, humeFft, useHume, lipSyncSensitivity, lipSyncSmoothing, lipSyncNoiseFloor, lipSyncSibilantThreshold, lipSyncClosedThreshold } = useAppStore.getState();

            let energyOu = 0, energyOh = 0, energyAa = 0, energyEe = 0, energyIh = 0;
            let hasAudio = false;

            if (useHume && humeFft && humeFft.length > 0) {
                // Hume FFT Logic
                // humeFft is likely 0-1 range? Or dB? Assuming 0-1 for now or normalized.
                // If it's 24 bands or similar.
                // Let's assume standard mapping if possible, or just map ranges.
                // We'll map indices roughly to the same bands.
                const fft = humeFft;
                const len = fft.length;

                // Simple mapping based on index ranges
                // Low
                for (let i = 0; i < Math.floor(len * 0.1); i++) energyOu += fft[i];
                energyOu /= Math.floor(len * 0.1);

                // Low-Mid
                for (let i = Math.floor(len * 0.1); i < Math.floor(len * 0.2); i++) energyOh += fft[i];
                energyOh /= Math.floor(len * 0.1);

                // Mid
                for (let i = Math.floor(len * 0.2); i < Math.floor(len * 0.4); i++) energyAa += fft[i];
                energyAa /= Math.floor(len * 0.2);

                // Mid-High
                for (let i = Math.floor(len * 0.4); i < Math.floor(len * 0.7); i++) energyEe += fft[i];
                energyEe /= Math.floor(len * 0.3);

                // High
                for (let i = Math.floor(len * 0.7); i < len; i++) energyIh += fft[i];
                energyIh /= Math.ceil(len * 0.3);

                // Scale up if needed (Hume might return small values)
                const scale = 0.5;
                energyOu *= scale; energyOh *= scale; energyAa *= scale; energyEe *= scale; energyIh *= scale;

                hasAudio = true; // Assuming if we have FFT we are speaking or listening

            } else if (isSpeaking && audioAnalyser) {
                // Standard Analyser Logic
                const dataArray = new Uint8Array(audioAnalyser.frequencyBinCount);
                audioAnalyser.getByteFrequencyData(dataArray);

                // 1. OU (Low) - Bins 1-3 (~170-500Hz)
                for (let i = 1; i <= 3; i++) energyOu += dataArray[i];
                energyOu /= 3;
                energyOu /= 255; // Normalize 0-1

                // 2. OH (Low-Mid) - Bins 4-6 (~680-1000Hz)
                for (let i = 4; i <= 6; i++) energyOh += dataArray[i];
                energyOh /= 3;
                energyOh /= 255;

                // 3. AA (Mid) - Bins 7-12 (~1.2-2kHz)
                for (let i = 7; i <= 12; i++) energyAa += dataArray[i];
                energyAa /= 6;
                energyAa /= 255;

                // 4. EE (Mid-High) - Bins 13-20 (~2.2-3.4kHz)
                for (let i = 13; i <= 20; i++) energyEe += dataArray[i];
                energyEe /= 8;
                energyEe /= 255;

                // 5. IH (High / Sibilants) - Bins 21-50 (~3.6-8.5kHz)
                for (let i = 21; i <= 50; i++) energyIh += dataArray[i];
                energyIh /= 30;
                energyIh /= 255;

                hasAudio = true;
            }

            if (hasAudio) {
                // --- Consonant Simulation Logic ---
                // Sibilant Detection (S, T, CH, SH, Z)
                const isSibilant = energyIh > (energyAa * lipSyncSibilantThreshold) && energyIh > (energyOu * lipSyncSibilantThreshold);
                // Closed/Hum Detection (M, N, B, P)
                const isClosed = energyOu > lipSyncClosedThreshold && energyAa < (energyOu * 0.6) && energyIh < (energyOu * 0.4);

                // Apply sensitivity
                let vOu = MathUtils.clamp(energyOu * lipSyncSensitivity, 0, 1);
                let vOh = MathUtils.clamp(energyOh * lipSyncSensitivity, 0, 1);
                let vAa = MathUtils.clamp(energyAa * lipSyncSensitivity, 0, 1);
                let vEe = MathUtils.clamp(energyEe * lipSyncSensitivity, 0, 1);
                let vIh = MathUtils.clamp(energyIh * lipSyncSensitivity, 0, 1);

                // Apply Overrides
                if (isSibilant) {
                    vIh = Math.max(vIh, 0.6 * lipSyncSensitivity);
                    vEe = Math.max(vEe, 0.5 * lipSyncSensitivity);
                    vAa *= 0.2;
                    vOh *= 0.2;
                    vOu *= 0.2;
                } else if (isClosed) {
                    vAa *= 0.05;
                    vOh *= 0.05;
                    vOu = Math.min(vOu, 0.2);
                    vEe *= 0.05;
                    vIh *= 0.05;
                } else {
                    if (vAa < lipSyncNoiseFloor) vAa = 0;
                    if (vOh < lipSyncNoiseFloor) vOh = 0;
                    if (vOu < lipSyncNoiseFloor) vOu = 0;
                    if (vEe < lipSyncNoiseFloor) vEe = 0;
                    if (vIh < lipSyncNoiseFloor) vIh = 0;
                }

                const lerpFactor = lipSyncSmoothing;
                const currentAa = vrm.expressionManager?.getValue('aa') || 0;
                const currentIh = vrm.expressionManager?.getValue('ih') || 0;
                const currentOu = vrm.expressionManager?.getValue('ou') || 0;
                const currentEe = vrm.expressionManager?.getValue('ee') || 0;
                const currentOh = vrm.expressionManager?.getValue('oh') || 0;

                vrm.expressionManager?.setValue('aa', MathUtils.lerp(currentAa, vAa, lerpFactor));
                vrm.expressionManager?.setValue('ih', MathUtils.lerp(currentIh, vIh, lerpFactor));
                vrm.expressionManager?.setValue('ou', MathUtils.lerp(currentOu, vOu, lerpFactor));
                vrm.expressionManager?.setValue('ee', MathUtils.lerp(currentEe, vEe, lerpFactor));
                vrm.expressionManager?.setValue('oh', MathUtils.lerp(currentOh, vOh, lerpFactor));
            } else {
                // Smoothly close mouth
                ['aa', 'ih', 'ou', 'ee', 'oh'].forEach(vowel => {
                    const current = vrm.expressionManager?.getValue(vowel) || 0;
                    vrm.expressionManager?.setValue(vowel, MathUtils.lerp(current, 0, 0.2));
                });
            }

            // Natural Blinking (2-4 second intervals with random variation)
            const blinkCycle = state.clock.elapsedTime % 3.5;
            const blinkDuration = 0.15;
            if (blinkCycle < blinkDuration) {
                const blinkProgress = blinkCycle / blinkDuration;
                const blinkValue = Math.sin(blinkProgress * Math.PI);
                vrm.expressionManager?.setValue('blink', blinkValue);
            } else {
                vrm.expressionManager?.setValue('blink', 0);
            }

            // ═══════════════════════════════════════════════════════════════
            // BREATHING SYSTEM - Emotional modulation with smooth transitions
            // ═══════════════════════════════════════════════════════════════
            const { breathingRate, breathingEnabled } = useAppStore.getState();

            if (breathingEnabled) {
                // Breathing profiles per emotion (based on psychological research)
                const breathingProfiles: Record<string, { rateMultiplier: number; amplitudeMultiplier: number; irregularity: number }> = {
                    neutral: { rateMultiplier: 1.0, amplitudeMultiplier: 1.0, irregularity: 0 },
                    relaxed: { rateMultiplier: 0.85, amplitudeMultiplier: 1.1, irregularity: 0 },
                    happy: { rateMultiplier: 1.15, amplitudeMultiplier: 1.1, irregularity: 0.1 },
                    angry: { rateMultiplier: 1.7, amplitudeMultiplier: 1.4, irregularity: 0.15 },
                    sad: { rateMultiplier: 0.75, amplitudeMultiplier: 0.85, irregularity: 0.25 },
                    surprised: { rateMultiplier: 2.0, amplitudeMultiplier: 1.6, irregularity: 0 },
                    extra: { rateMultiplier: 1.2, amplitudeMultiplier: 1.2, irregularity: 0.1 },
                    blink: { rateMultiplier: 1.0, amplitudeMultiplier: 1.0, irregularity: 0 },
                    fun: { rateMultiplier: 1.2, amplitudeMultiplier: 1.15, irregularity: 0.1 },
                    joy: { rateMultiplier: 1.25, amplitudeMultiplier: 1.2, irregularity: 0.15 },
                    sorrow: { rateMultiplier: 0.7, amplitudeMultiplier: 0.8, irregularity: 0.3 },
                };

                // Get current emotion profile (default to neutral)
                const currentEmotionKey = triggeredEmotion || 'neutral';
                const profile = breathingProfiles[currentEmotionKey] || breathingProfiles.neutral;

                // Calculate target breathing rate and amplitude
                const targetBreathRate = breathingRate * profile.rateMultiplier;
                const targetAmplitude = 0.015 * profile.amplitudeMultiplier;

                // Use window for persistent state across frames (smoother than useState)
                const breathState = (window as any).__breathingState || {
                    currentRate: targetBreathRate,
                    currentAmplitude: targetAmplitude,
                    phase: 0,
                };

                // Smooth transition to target values (2-3 second transition)
                const transitionSpeed = 0.5 * delta; // ~2 seconds to full transition
                breathState.currentRate = MathUtils.lerp(breathState.currentRate, targetBreathRate, transitionSpeed);
                breathState.currentAmplitude = MathUtils.lerp(breathState.currentAmplitude, targetAmplitude, transitionSpeed);

                // Calculate breathing frequency (Hz) from BPM
                const breathFrequency = breathState.currentRate / 60;

                // Update phase
                breathState.phase += breathFrequency * delta;
                if (breathState.phase > 1) breathState.phase -= 1;

                // Add irregularity for sad/emotional states
                const irregularityOffset = profile.irregularity > 0
                    ? Math.sin(state.clock.elapsedTime * 0.3) * profile.irregularity * 0.1
                    : 0;

                // Realistic breathing curve: inhale (40%) faster than exhale (60%)
                let breathValue: number;
                const phase = breathState.phase;
                if (phase < 0.4) {
                    // Inhale phase (0-40%) - slightly faster rise
                    breathValue = Math.sin((phase / 0.4) * (Math.PI / 2));
                } else {
                    // Exhale phase (40-100%) - slower, smoother fall
                    breathValue = Math.cos(((phase - 0.4) / 0.6) * (Math.PI / 2));
                }

                // Apply breathing to chest with amplitude and irregularity
                const chest = vrm.humanoid.getNormalizedBoneNode('chest');
                if (chest) {
                    chest.rotation.x = breathValue * breathState.currentAmplitude + irregularityOffset;
                }

                // Store state for next frame
                (window as any).__breathingState = breathState;
            }

            // ═══════════════════════════════════════════════════════════════
            // IDLE MICRO-MOVEMENTS - Natural subtle body animation
            // ═══════════════════════════════════════════════════════════════
            const time = state.clock.elapsedTime;

            // === BODY SWAY (hips/spine) ===
            // Use multiple sine waves with incommensurate frequencies for organic feel
            const swayX = Math.sin(time * 0.23) * 0.003 + Math.sin(time * 0.37) * 0.002;
            const swayZ = Math.sin(time * 0.19) * 0.002 + Math.cos(time * 0.31) * 0.0015;

            const hips = vrm.humanoid.getNormalizedBoneNode('hips');
            const spine = vrm.humanoid.getNormalizedBoneNode('spine');

            if (hips) {
                hips.rotation.x = MathUtils.lerp(hips.rotation.x, swayX, 0.02);
                hips.rotation.z = MathUtils.lerp(hips.rotation.z, swayZ, 0.02);
            }

            if (spine) {
                // Spine follows hips slightly delayed (natural body mechanics)
                spine.rotation.x = MathUtils.lerp(spine.rotation.x, swayX * 0.5, 0.015);
                spine.rotation.z = MathUtils.lerp(spine.rotation.z, -swayZ * 0.3, 0.015);
            }

            // === SHOULDER MICRO-MOVEMENT ===
            // One shoulder slightly higher than the other, alternating slowly
            const shoulderOffset = Math.sin(time * 0.13) * 0.008;
            const leftShoulder = vrm.humanoid.getNormalizedBoneNode('leftShoulder');
            const rightShoulder = vrm.humanoid.getNormalizedBoneNode('rightShoulder');

            if (leftShoulder) {
                leftShoulder.rotation.z = MathUtils.lerp(leftShoulder.rotation.z, shoulderOffset, 0.01);
            }
            if (rightShoulder) {
                rightShoulder.rotation.z = MathUtils.lerp(rightShoulder.rotation.z, -shoulderOffset * 0.8, 0.01);
            }

            // === UPPER ARM SUBTLE DRIFT ===
            // Very subtle natural arm position adjustment
            const armDrift = Math.sin(time * 0.17) * 0.005;
            const leftUpperArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
            const rightUpperArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');

            if (leftUpperArm) {
                leftUpperArm.rotation.x = MathUtils.lerp(leftUpperArm.rotation.x, armDrift, 0.008);
            }
            if (rightUpperArm) {
                rightUpperArm.rotation.x = MathUtils.lerp(rightUpperArm.rotation.x, -armDrift * 0.7, 0.008);
            }

            // === HEAD MICRO-MOVEMENTS ===
            // Very subtle head tilts (in addition to gaze tracking)
            // This gets added to the gaze tracking rotation below
            const headMicroTilt = Math.sin(time * 0.29) * 0.004 + Math.sin(time * 0.47) * 0.002;
            (window as any).__headMicroTilt = headMicroTilt;

            // Gaze tracking - head follows camera (viewer)
            // Uses quaternion lookAt to correctly orient head toward camera regardless of body pose
            const head = vrm.humanoid.getNormalizedBoneNode('head');
            const neck = vrm.humanoid.getNormalizedBoneNode('neck');

            if (head && neck) {
                // Get camera position and head world position
                const cameraPos = state.camera.position.clone();
                const headWorldPos = new Vector3();
                head.getWorldPosition(headWorldPos);

                // Direction from head to camera in WORLD space
                const dirToCameraWorld = cameraPos.clone().sub(headWorldPos).normalize();

                // Get neck's world quaternion (includes all parent transforms)
                const neckWorldQuat = new Quaternion();
                neck.getWorldQuaternion(neckWorldQuat);

                // Transform camera direction from WORLD space to NECK's LOCAL space
                const invNeckQuat = neckWorldQuat.clone().invert();
                const dirToCameraLocal = dirToCameraWorld.clone().applyQuaternion(invNeckQuat);

                // VRM scene is rotated 180° on Y - flip direction to match model's perspective
                const targetDir = new Vector3(-dirToCameraLocal.x, dirToCameraLocal.y, -dirToCameraLocal.z).normalize();

                // Create quaternion that rotates from forward (+Z) to target direction
                const forward = new Vector3(0, 0, 1);
                const lookAtQuat = new Quaternion().setFromUnitVectors(forward, targetDir);

                // Extract euler angles (YXZ order matches head bone rotation order)
                const lookAtEuler = new Euler().setFromQuaternion(lookAtQuat, 'YXZ');

                // Get raw rotation values (negate pitch for correct direction)
                const rawYaw = lookAtEuler.y;
                const rawPitch = -lookAtEuler.x; // NEGATED to fix Y inversion

                // NATURAL HEAD MOVEMENT LIMITS
                const maxYaw = Math.PI * 0.4;  // ~72° left/right
                const maxPitch = Math.PI * 0.25; // ~45° up/down
                const maxCombinedAngle = Math.PI * 0.35; // ~63° total

                // Calculate total angular distance from forward
                const totalAngle = Math.acos(MathUtils.clamp(targetDir.z, -1, 1));

                let finalYaw: number, finalPitch: number;

                if (totalAngle <= maxCombinedAngle) {
                    // Within comfortable range
                    finalYaw = MathUtils.clamp(rawYaw, -maxYaw, maxYaw);
                    finalPitch = MathUtils.clamp(rawPitch, -maxPitch, maxPitch);
                } else {
                    // Scale back proportionally
                    const scale = maxCombinedAngle / totalAngle;
                    finalYaw = MathUtils.clamp(rawYaw * scale, -maxYaw, maxYaw);
                    finalPitch = MathUtils.clamp(rawPitch * scale, -maxPitch, maxPitch);
                }

                // Natural head roll + idle micro-tilt
                const headMicroTilt = (window as any).__headMicroTilt || 0;
                const naturalRoll = finalYaw * 0.08 + headMicroTilt;

                // Smooth lerp
                const lerpFactor = 0.06;

                head.rotation.y = MathUtils.lerp(head.rotation.y, finalYaw, lerpFactor);
                head.rotation.x = MathUtils.lerp(head.rotation.x, finalPitch, lerpFactor);
                head.rotation.z = MathUtils.lerp(head.rotation.z, naturalRoll, lerpFactor);
            }
        }
    });

    return vrm ? <primitive object={vrm.scene} /> : null;
};
