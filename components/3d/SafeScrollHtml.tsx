'use client';

import { useScroll, useContextBridge } from '@react-three/drei';
import { useLayoutEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';

export default function SafeScrollHtml({ children, style, className }: any) {
    const scroll = useScroll();
    const ContextBridge = useContextBridge();
    const rootRef = useRef<Root | null>(null);

    useLayoutEffect(() => {
        const el = scroll.el;
        if (!el) return;

        // Create container div
        const div = document.createElement('div');
        div.style.width = '100%';
        div.style.height = '100%';
        div.style.position = 'absolute';
        div.style.top = '0';
        div.style.left = '0';
        if (style) Object.assign(div.style, style);
        if (className) div.className = className;

        el.appendChild(div);

        // Create Root
        const root = createRoot(div);
        rootRef.current = root;

        // Initial Render
        root.render(<ContextBridge>{children}</ContextBridge>);

        return () => {
            root.unmount();
            if (el.contains(div)) el.removeChild(div);
            rootRef.current = null;
        };
    }, [scroll.el]);

    // Update on children change
    useLayoutEffect(() => {
        if (rootRef.current) {
            rootRef.current.render(<ContextBridge>{children}</ContextBridge>);
        }
    }, [children, ContextBridge]);

    return <group />;
}
