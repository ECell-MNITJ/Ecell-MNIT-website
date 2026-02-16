'use client';

import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import SimpleModel from './SimpleModel';

export default function FixedBackground() {
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
        <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                {/* Background Color & Fog for depth */}
                <color attach="background" args={['#050505']} />
                <fog attach="fog" args={['#050505', 5, 20]} />

                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <Environment preset="city" />

                <Suspense fallback={null}>
                    <SimpleModel isMobile={isMobile} />
                </Suspense>
            </Canvas>
        </div>
    );
}
