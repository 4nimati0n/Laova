import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EmpathicAvatar } from './EmpathicAvatar';
import type { EmotionTuningParams } from '../utils/emotionTuning';
import type { CompassionParams } from '../utils/compassionMapping';

interface EmotionScore {
    name: string;
    score: number;
}

interface EmpathicSceneProps {
    emotions: EmotionScore[];
    tuningParams?: EmotionTuningParams;
    compassionParams?: CompassionParams;
    onVrmExpressionsChange?: (expressions: Record<string, number>) => void;
    onRawExpressionsChange?: (expressions: Record<string, number>) => void;
}

export const EmpathicScene = ({ emotions, tuningParams, compassionParams, onVrmExpressionsChange, onRawExpressionsChange }: EmpathicSceneProps) => {
    return (
        <Canvas
            camera={{
                position: [0, 1.2, 2.5],
                fov: 35,
                near: 0.1,
                far: 100
            }}
            style={{ background: 'transparent' }}
        >
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight
                position={[2, 3, 2]}
                intensity={1.2}
                castShadow
            />
            <directionalLight
                position={[-2, 2, -1]}
                intensity={0.4}
            />

            {/* Avatar */}
            <EmpathicAvatar
                emotions={emotions}
                tuningParams={tuningParams}
                compassionParams={compassionParams}
                onExpressionsChange={onVrmExpressionsChange}
                onRawExpressionsChange={onRawExpressionsChange}
            />

            {/* Minimal controls - just zoom */}
            <OrbitControls
                enablePan={false}
                enableRotate={false}
                minDistance={1.5}
                maxDistance={4}
                target={[0, 1.2, 0]}
            />
        </Canvas>
    );
};
