import { useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Avatar } from './Avatar';
import { Group, Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useAppStore } from '../store/useAppStore';

export const Scene = () => {
    const groupRef = useRef<Group>(null);
    const orbitRef = useRef<OrbitControlsImpl>(null);
    const { visualizationEnabled } = useAppStore();

    // Custom Drag State
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef(new Vector3());
    const dragPlaneZ = useRef(0);

    const onLauraPointerDown = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation(); // Stop event from hitting background/orbit
        if (orbitRef.current) orbitRef.current.enabled = false;
        setIsDragging(true);

        // Calculate offset from the intersection point to the group position
        // We project everything onto the Z plane of the group
        if (groupRef.current) {
            dragPlaneZ.current = groupRef.current.position.z;
            // We want to drag on the plane Z = group.z
            // e.point is the 3D point on the mesh surface
            // We'll use the mouse projection on the plane for movement
            // But for simplicity, let's just use the difference between hit point and group pos
            dragOffset.current.subVectors(groupRef.current.position, e.point);
        }
    };

    const onPlanePointerMove = (e: ThreeEvent<PointerEvent>) => {
        if (isDragging && groupRef.current) {
            e.stopPropagation();
            // Move group to new point + offset
            // We only update X and Y to keep her on the floor/plane
            // But e.point.z might vary if plane is tilted? Plane is flat (0,0,1) normal.
            const newX = e.point.x + dragOffset.current.x;
            const newY = e.point.y + dragOffset.current.y;

            groupRef.current.position.setX(newX);
            groupRef.current.position.setY(newY);
        }
    };

    const onPointerUp = () => {
        if (isDragging) {
            setIsDragging(false);
            if (orbitRef.current && groupRef.current) {
                orbitRef.current.enabled = true;

                // Fix Snap: Update Target and Camera
                const newPos = new Vector3();
                groupRef.current.getWorldPosition(newPos);
                const newTarget = new Vector3(newPos.x, newPos.y + 0.9, newPos.z);

                const currentTarget = orbitRef.current.target.clone();
                const delta = new Vector3().subVectors(newTarget, currentTarget);

                orbitRef.current.target.copy(newTarget);
                if (orbitRef.current.object) {
                    orbitRef.current.object.position.add(delta);
                }
                orbitRef.current.update();
            }
        }
    };

    return (
        <div className="scene-container" style={{ pointerEvents: 'none' }}>
            <Canvas
                camera={{ position: [0, 1.4, 2], fov: 35 }}
                gl={{ alpha: true }}
                style={{ background: visualizationEnabled ? 'transparent' : '#000000', pointerEvents: 'none' }}
                eventSource={document.getElementById('root')!}
                eventPrefix="client"
            >
                {!visualizationEnabled && <color attach="background" args={['#000000']} />}

                <ambientLight intensity={visualizationEnabled ? 0.8 : 0.5} />
                <pointLight position={[10, 10, 10]} intensity={visualizationEnabled ? 1.5 : 1} />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={visualizationEnabled ? 1.5 : 1} />

                <Suspense fallback={null}>
                    {/* ErrorBoundary removed as per instructions, fallback set to null */}
                    <>
                        <group
                            ref={groupRef}
                            position={[0, -0.9, 0]}
                            onPointerDown={onLauraPointerDown}
                            onPointerUp={onPointerUp}
                        >
                            <Avatar />
                        </group>
                    </>
                </Suspense>

                {/* Drag Plane - Invisible plane to catch mouse moves during drag */}
                {isDragging && (
                    <mesh
                        position={[0, 0, 0]} // Center
                        rotation={[0, 0, 0]} // Facing Z
                        visible={false} // Invisible but interactive? No, visible={false} disables raycast usually.
                        // We use transparent material instead
                        onPointerMove={onPlanePointerMove}
                        onPointerUp={onPointerUp}
                    >
                        <planeGeometry args={[100, 100]} />
                        <meshBasicMaterial visible={false} />
                    </mesh>
                )}

                <OrbitControls
                    ref={orbitRef}
                    enableZoom={true}
                    enablePan={false}
                    target={[0, 0, 0]}
                    minDistance={1.5}
                    maxDistance={3}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.8}
                    makeDefault
                />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
};
