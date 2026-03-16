'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const [isPointer, setIsPointer] = useState(false);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isClickable = target.closest('a, button, [role="button"], .cursor-pointer');
            if (isClickable) setIsPointer(true);
        };

        const handleMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isClickable = target.closest('a, button, [role="button"], .cursor-pointer');
            if (isClickable) setIsPointer(false);
        };

        window.addEventListener('mousemove', moveCursor, { passive: true });
        window.addEventListener('mouseover', handleMouseOver);
        window.addEventListener('mouseout', handleMouseOut);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
            window.removeEventListener('mouseout', handleMouseOut);
        };
    }, [cursorX, cursorY]);

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none hidden lg:block">
            {/* Main Cursor Dot */}
            <motion.div
                className="absolute w-3 h-3 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
                style={{
                    x: cursorX,
                    y: cursorY,
                }}
                animate={{
                    scale: isPointer ? 3 : 1,
                    backgroundColor: isPointer ? 'rgba(168, 85, 247, 1)' : 'rgba(255, 255, 255, 1)',
                }}
                transition={{
                    scale: { type: 'spring', damping: 15, stiffness: 200 },
                    backgroundColor: { duration: 0.2 }
                }}
            />
        </div>
    );
}
