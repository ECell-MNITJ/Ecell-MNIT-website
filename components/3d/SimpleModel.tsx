'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

interface SimpleModelProps {
    isMobile?: boolean;
}

export default function SimpleModel({ isMobile = false }: SimpleModelProps) {
    const groupRef = useRef<THREE.Group>(null);
    const linesRef = useRef<THREE.LineSegments>(null);
    const meshRef = useRef<THREE.InstancedMesh>(null);

    // Network configuration
    const particleCount = isMobile ? 60 : 150;
    const connectionDistance = isMobile ? 3 : 2.5;

    // Generate random positions and velocities
    const [positions, initialPositions] = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const initPos = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            // Spread nodes
            pos[i * 3] = (Math.random() - 0.5) * 18;     // x
            pos[i * 3 + 1] = (Math.random() - 0.5) * 25; // y
            pos[i * 3 + 2] = (Math.random() - 0.5) * 12; // z

            initPos[i * 3] = pos[i * 3];
            initPos[i * 3 + 1] = pos[i * 3 + 1];
            initPos[i * 3 + 2] = pos[i * 3 + 2];
        }
        return [pos, initPos];
    }, [particleCount]);

    const scrollRef = useRef(0);

    // Geometry & Material
    const nodeGeometry = useMemo(() => new THREE.SphereGeometry(isMobile ? 0.06 : 0.04, 8, 8), [isMobile]);
    const nodeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: "#fbbf24",
        emissive: "#fbbf24",
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0.9
    }), []);

    // Scroll listener
    useEffect(() => {
        const handleScroll = () => {
            scrollRef.current = window.scrollY;
        };
        // Set initial value
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Animation loop
    useFrame((state) => {
        if (!groupRef.current) return;

        const time = state.clock.getElapsedTime();

        // Simple continuous rotation + Scroll interaction
        // Rotate based on scroll position - subtle effect
        groupRef.current.rotation.y = time * 0.05 + scrollRef.current * 0.0002;
        // Removed vertical position change to prevent model from moving off-screen

        // 2. NETWORK ANIMATION
        if (meshRef.current) {
            const tempObject = new THREE.Object3D();
            const linePositions = [];

            for (let i = 0; i < particleCount; i++) {
                // Add gently floating "breathing" motion
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
                <lineBasicMaterial color="#4ade80" transparent opacity={0.10} linewidth={1} />
            </lineSegments>
        </group>
    );
}
