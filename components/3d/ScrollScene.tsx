'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, ScrollControls } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import Model from './Model';
import Overlay from './Overlay';

interface ScrollSceneProps {
    events: any[];
    startups: any[];
    stats: any[];
}

export default function ScrollScene({ events, startups, stats }: ScrollSceneProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="h-screen w-full relative">
            <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
                {/* Background Color & Fog for depth */}
                <color attach="background" args={['#050505']} />
                <fog attach="fog" args={['#050505', 5, 20]} />

                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <Environment preset="city" />

                <Suspense fallback={null}>
                    {/* Increased pages to accommodate full home page content */}
                    <ScrollControls pages={isMobile ? 7.5 : 5.2} damping={0.2} style={{ scrollbarWidth: 'none' }}>
                        <Model isMobile={isMobile} />
                        <Overlay events={events} startups={startups} stats={stats} />
                    </ScrollControls>
                </Suspense>
            </Canvas>
        </div>
    );
}
