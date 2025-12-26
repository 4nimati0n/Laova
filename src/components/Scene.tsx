import { Canvas, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Avatar } from './Avatar';
import { Suspense, useRef, useState, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Group, Vector3, Raycaster, Vector2 } from 'three';
import { useAppStore } from '../store/useAppStore';



// Unified interaction controller
// - Click on Laura + Drag → Pan (move camera parallel to screen)
// - Click on background + Drag → Rotate Laura around her center
const InteractionController = ({
    pivotRef
}: {
    pivotRef: React.RefObject<Group>;
}) => {
    const { camera, gl, scene } = useThree();
    const [mode, setMode] = useState<'none' | 'drag' | 'rotate'>('none');

    // Drag state
    const dragStart = useRef({ x: 0, y: 0 });
    const pivotStart = useRef(new Vector3());
    const raycaster = useRef(new Raycaster());
    const pointer = useRef(new Vector2());

    // Rotate state
    const rotateStart = useRef({ x: 0, y: 0 });
    const pivotRotationStart = useRef({ x: 0, y: 0 });

    // Check if click is on Laura (raycast against scene children)
    const isClickOnLaura = (clientX: number, clientY: number): boolean => {
        const rect = gl.domElement.getBoundingClientRect();
        pointer.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointer.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.current.setFromCamera(pointer.current, camera);
        const intersects = raycaster.current.intersectObjects(scene.children, true);

        return intersects.length > 0 && intersects[0].object.type === 'SkinnedMesh';
    };

    useEffect(() => {
        const canvas = gl.domElement;

        const handlePointerDown = (e: PointerEvent) => {
            const onLaura = isClickOnLaura(e.clientX, e.clientY);

            if (onLaura) {
                setMode('drag');
                dragStart.current = { x: e.clientX, y: e.clientY };
                pivotStart.current.copy(pivotRef.current?.position || new Vector3());
                canvas.style.cursor = 'grabbing';
            } else {
                setMode('rotate');
                rotateStart.current = { x: e.clientX, y: e.clientY };
                pivotRotationStart.current = {
                    x: pivotRef.current?.rotation.x || 0,
                    y: pivotRef.current?.rotation.y || 0
                };
                canvas.style.cursor = 'move';
            }
        };

        const handlePointerMove = (e: PointerEvent) => {
            if (mode === 'none') return;

            if (mode === 'drag' && pivotRef.current) {
                // Pan: move Laura along screen-parallel plane
                const deltaX = (e.clientX - dragStart.current.x) * 0.005;
                const deltaY = (e.clientY - dragStart.current.y) * 0.005;

                // Get camera's right and up vectors
                const right = new Vector3();
                const up = new Vector3();
                camera.getWorldDirection(new Vector3()); // Update matrix
                right.setFromMatrixColumn(camera.matrix, 0); // Right vector
                up.setFromMatrixColumn(camera.matrix, 1); // Up vector

                // Move Laura along screen-parallel plane (positive deltaX = move right)
                pivotRef.current.position.copy(pivotStart.current)
                    .addScaledVector(right, deltaX)
                    .addScaledVector(up, -deltaY);

            } else if (mode === 'rotate' && pivotRef.current) {
                const deltaX = e.clientX - rotateStart.current.x;
                const deltaY = e.clientY - rotateStart.current.y;

                // Y rotation: horizontal mouse movement (turn left/right) - unlimited
                pivotRef.current.rotation.y = pivotRotationStart.current.y + deltaX * 0.01;

                // X rotation: vertical mouse movement (tilt up/down) - unlimited
                pivotRef.current.rotation.x = pivotRotationStart.current.x - deltaY * 0.01;
            }
        };

        const handlePointerUp = () => {
            setMode('none');
            canvas.style.cursor = 'default';
        };

        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerup', handlePointerUp);
        canvas.addEventListener('pointerleave', handlePointerUp);

        return () => {
            canvas.removeEventListener('pointerdown', handlePointerDown);
            canvas.removeEventListener('pointermove', handlePointerMove);
            canvas.removeEventListener('pointerup', handlePointerUp);
            canvas.removeEventListener('pointerleave', handlePointerUp);
        };
    }, [mode, camera, gl, pivotRef, scene]);

    // Zoom with mouse wheel - scale Laura around her center of gravity
    useEffect(() => {
        const canvas = gl.domElement;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (!pivotRef.current) return;

            const zoomSpeed = 0.001;
            const currentScale = pivotRef.current.scale.x;

            // Calculate new scale (inverse delta so scroll up = bigger)
            const newScale = currentScale - e.deltaY * zoomSpeed;
            const clampedScale = Math.max(0.5, Math.min(3, newScale));

            // Apply uniform scale to Laura - centered on pivot (her hara)
            pivotRef.current.scale.setScalar(clampedScale);

            // Save zoom level for debug panel
            (window as any).__lauraZoom = clampedScale;
        };

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        return () => canvas.removeEventListener('wheel', handleWheel);
    }, [gl, pivotRef]);

    return null;
};

export const Scene = () => {
    // Pivot at Laura's center of gravity - rotation happens around this point
    const pivotRef = useRef<Group>(null);
    const { visualizationEnabled } = useAppStore();

    return (
        <div className="scene-container">
            <Canvas
                camera={{ position: [0, 0.5, 2.5], fov: 35 }}
                gl={{ alpha: true }}
                style={{ background: visualizationEnabled ? 'transparent' : '#000000' }}
            >
                {!visualizationEnabled && <color attach="background" args={['#000000']} />}

                <ambientLight intensity={visualizationEnabled ? 0.8 : 0.5} />
                <pointLight position={[10, 10, 10]} intensity={visualizationEnabled ? 1.5 : 1} />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={visualizationEnabled ? 1.5 : 1} />

                <Suspense fallback={null}>
                    <ErrorBoundary fallback={
                        <mesh>
                            <sphereGeometry args={[0.5]} />
                            <meshStandardMaterial color="red" wireframe />
                        </mesh>
                    }>
                        {/* Pivot at hara (center of gravity) - rotation happens here */}
                        <group ref={pivotRef} position={[0, 0, 0]}>
                            {/* Avatar offset so her hara (navel) aligns with pivot */}
                            <group position={[0, -0.9, 0]}>
                                <Avatar />
                            </group>
                        </group>
                    </ErrorBoundary>
                </Suspense>

                <InteractionController pivotRef={pivotRef} />

                <Environment preset="city" />
            </Canvas>
        </div>
    );
};
