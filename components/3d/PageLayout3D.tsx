'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, ScrollControls } from '@react-three/drei';
import React, { Suspense, useState, useEffect } from 'react';
import Model from './Model';
import SafeScrollHtml from './SafeScrollHtml';

interface PageLayout3DProps {
    children: React.ReactNode;
    pages?: number;
    mobilePages?: number;
}

export default function PageLayout3D({ children, pages = 4, mobilePages }: PageLayout3DProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const activePages = isMobile && mobilePages ? mobilePages : pages;

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
                    <ScrollControls pages={activePages} damping={0.2} style={{ scrollbarWidth: 'none' }}>
                        <Model isMobile={isMobile} />
                        <SafeScrollHtml style={{ width: '100%', height: '100%' }}>
                            {children}
                        </SafeScrollHtml>
                    </ScrollControls>
                </Suspense>
            </Canvas>
        </div>
    );
}
