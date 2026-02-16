'use client';

import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface ModelProps {
    isMobile: boolean;
}

export default function Model({ isMobile }: ModelProps) {
    const scroll = useScroll();
    const groupRef = useRef<THREE.Group>(null);
    const linesRef = useRef<THREE.LineSegments>(null);
    const meshRef = useRef<THREE.InstancedMesh>(null);

    // Network configuration
    const particleCount = isMobile ? 60 : 200;
    const connectionDistance = isMobile ? 3 : 3.5;

    // Generate random positions and velocities
    const [positions, velocity, initialPositions] = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const vel = new Float32Array(particleCount * 3);
        const initPos = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            // Spread nodes
            pos[i * 3] = (Math.random() - 0.5) * 18;     // x
            pos[i * 3 + 1] = (Math.random() - 0.5) * 25; // y
            pos[i * 3 + 2] = (Math.random() - 0.5) * 12; // z

            initPos[i * 3] = pos[i * 3];
            initPos[i * 3 + 1] = pos[i * 3 + 1];
            initPos[i * 3 + 2] = pos[i * 3 + 2];

            vel[i * 3] = (Math.random() - 0.5) * 0.005; // Slower velocity
            vel[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
            vel[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
        }
        return [pos, vel, initPos];
    }, [particleCount]);

    // Geometry & Material
    // Smaller, more "star-like" nodes
    const nodeGeometry = useMemo(() => new THREE.SphereGeometry(isMobile ? 0.05 : 0.025, 8, 8), [isMobile]);
    const nodeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: "#fbbf24",
        emissive: "#fbbf24",
        emissiveIntensity: 0.8, // Glowing effect
        roughness: 0.1,
        metalness: 0.9
    }), []);

    // Animation loop
    useFrame((state) => {
        if (!groupRef.current) return;

        const time = state.clock.getElapsedTime();
        const offset = scroll.offset;
        const camera = state.camera;

        // Rotate the entire group slowly
        groupRef.current.rotation.y = offset * Math.PI * 0.5 + time * 0.02;

        // Camera Waypoints
        const p0 = new THREE.Vector3(0, 0, 8);
        const p1 = new THREE.Vector3(-2, 0, 5);
        const p2 = new THREE.Vector3(2, 3, 3);
        const p3 = new THREE.Vector3(0, -2, 2);
        const p4 = new THREE.Vector3(-2, -5, 4);
        const p5 = new THREE.Vector3(0, -8, 6);

        const segment = 0.2;
        if (offset < segment * 1) {
            camera.position.lerpVectors(p0, p1, offset / segment);
        } else if (offset < segment * 2) {
            camera.position.lerpVectors(p1, p2, (offset - segment) / segment);
        } else if (offset < segment * 3) {
            camera.position.lerpVectors(p2, p3, (offset - segment * 2) / segment);
        } else if (offset < segment * 4) {
            camera.position.lerpVectors(p3, p4, (offset - segment * 3) / segment);
        } else {
            camera.position.lerpVectors(p4, p5, (offset - segment * 4) / segment);
        }

        camera.lookAt(0, camera.position.y * 0.5, 0);

        // 2. NETWORK ANIMATION
        if (meshRef.current) {
            const tempObject = new THREE.Object3D();
            const linePositions = [];

            for (let i = 0; i < particleCount; i++) {
                // Add gently floating "breathing" motion using sine waves
                positions[i * 3] = initialPositions[i * 3] + Math.sin(time * 0.5 + i) * 0.5;
                positions[i * 3 + 1] = initialPositions[i * 3 + 1] + Math.cos(time * 0.3 + i) * 0.5;
                positions[i * 3 + 2] = initialPositions[i * 3 + 2] + Math.sin(time * 0.2 + i * 0.5) * 0.3;

                // Update Instance Matrix
                tempObject.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
                tempObject.updateMatrix();
                meshRef.current.setMatrixAt(i, tempObject.matrix);
            }
            meshRef.current.instanceMatrix.needsUpdate = true;

            // Connections
            if (linesRef.current) {
                for (let i = 0; i < particleCount; i++) {
                    const x1 = positions[i * 3];
                    const y1 = positions[i * 3 + 1];
                    const z1 = positions[i * 3 + 2];

                    for (let j = i + 1; j < particleCount; j++) {
                        const x2 = positions[j * 3];
                        const y2 = positions[j * 3 + 1];
                        const z2 = positions[j * 3 + 2];

                        const dist = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);

                        if (dist < connectionDistance) {
                            linePositions.push(x1, y1, z1);
                            linePositions.push(x2, y2, z2);
                        }
                    }
                }

                // Prepare buffer attributes for lines
                // Note: creating new Float32Array every frame is okay for this count, but could be optimized.
                // For < 1000 lines, it's generally fine.
                linesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
            }
        }
    });

    return (
        <group ref={groupRef}>
            <instancedMesh ref={meshRef} args={[nodeGeometry, nodeMaterial, particleCount]}>
            </instancedMesh>

            <lineSegments ref={linesRef}>
                <bufferGeometry />
                <lineBasicMaterial color="#fbbf24" transparent opacity={0.2} linewidth={1} />
            </lineSegments>
        </group>
    );
}
