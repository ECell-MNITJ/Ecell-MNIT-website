'use client';

import { useEffect, useRef } from 'react';

const BackgroundCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let pRotate = 0;

        // Globe Settings
        const GLOBE_RADIUS = Math.min(width, height) * 0.45; // Increased size
        const DOT_COUNT = 300;
        const DOT_SIZE = 2;
        const CONNECTION_DIST = GLOBE_RADIUS * 0.35;

        interface Point3D {
            x: number;
            y: number;
            z: number;
            baseX: number;
            baseY: number;
            baseZ: number;
            type: 'node' | 'satellite';
            icon?: 'rocket' | 'bulb' | 'graph';
            phase: number; // For satellite orbit
        }

        let points: Point3D[] = [];
        let rotation = { x: 0, y: 0 };
        let targetRotation = { x: 0, y: 0 };

        // Initialize Fibonacci Sphere
        const initGlobe = () => {
            points = [];

            // Standard Nodes
            const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

            for (let i = 0; i < DOT_COUNT; i++) {
                const y = 1 - (i / (DOT_COUNT - 1)) * 2; // y goes from 1 to -1
                const radius = Math.sqrt(1 - y * y); // Radius at y

                const theta = phi * i;

                const x = Math.cos(theta) * radius;
                const z = Math.sin(theta) * radius;

                points.push({
                    x: x * GLOBE_RADIUS,
                    y: y * GLOBE_RADIUS,
                    z: z * GLOBE_RADIUS,
                    baseX: x * GLOBE_RADIUS,
                    baseY: y * GLOBE_RADIUS,
                    baseZ: z * GLOBE_RADIUS,
                    type: 'node',
                    phase: 0
                });
            }

            // Satellites (Orbiting Elements)
            const satellites = [
                { icon: 'rocket' as const, speed: 0.02, radiusMult: 1.2 },
                { icon: 'bulb' as const, speed: 0.015, radiusMult: 1.3 },
                { icon: 'graph' as const, speed: 0.025, radiusMult: 1.15 }
            ];

            satellites.forEach((sat, i) => {
                // Add a few of each
                for (let j = 0; j < 3; j++) {
                    points.push({
                        x: 0, y: 0, z: 0,
                        baseX: sat.radiusMult * GLOBE_RADIUS, // Just radius holder
                        baseY: (Math.random() - 0.5) * GLOBE_RADIUS, // Random orbit tilt
                        baseZ: sat.speed, // Speed holder
                        type: 'satellite',
                        icon: sat.icon,
                        phase: (Math.PI * 2 / 3) * j + (i * Math.PI / 3)
                    });
                }
            });
        };

        const rotateX = (p: Point3D, angle: number) => {
            const y = p.y * Math.cos(angle) - p.z * Math.sin(angle);
            const z = p.y * Math.sin(angle) + p.z * Math.cos(angle);
            p.y = y;
            p.z = z;
        };

        const rotateY = (p: Point3D, angle: number) => {
            const x = p.x * Math.cos(angle) - p.z * Math.sin(angle);
            const z = p.x * Math.sin(angle) + p.z * Math.cos(angle);
            p.x = x;
            p.z = z;
        }

        const project = (p: Point3D): { x: number, y: number, scale: number, visible: boolean } => {
            const perspective = width; // Fov
            const scale = perspective / (perspective + p.z + GLOBE_RADIUS * 1.5); // Move globe back
            const x = p.x * scale + width / 2;
            const y = p.y * scale + height / 2;

            return { x, y, scale, visible: true }; // p.z > -GLOBE_RADIUS * 0.5 can hide back
        };

        const drawIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, icon: string, scale: number) => {
            const s = 20 * scale;
            ctx.save();
            ctx.translate(x, y);
            ctx.strokeStyle = '#FFB800'; // Gold
            ctx.fillStyle = 'rgba(255, 184, 0, 0.2)';
            ctx.lineWidth = 2;

            ctx.beginPath();
            if (icon === 'rocket') {
                // Simple triangle/rocket shape
                ctx.moveTo(0, -s);
                ctx.lineTo(-s / 2, s / 2);
                ctx.lineTo(0, s / 3);
                ctx.lineTo(s / 2, s / 2);
                ctx.closePath();
            } else if (icon === 'bulb') {
                // Circle with base
                ctx.arc(0, -s / 4, s / 2, 0, Math.PI * 2);
                ctx.moveTo(-s / 4, s / 3);
                ctx.lineTo(s / 4, s / 3);
                ctx.lineTo(s / 4, s / 2);
                ctx.lineTo(-s / 4, s / 2);
            } else if (icon === 'graph') {
                // Zig zag
                ctx.moveTo(-s / 2, s / 2);
                ctx.lineTo(-s / 6, 0);
                ctx.lineTo(s / 6, s / 3);
                ctx.lineTo(s / 2, -s / 2);
            }
            ctx.stroke();
            ctx.fill();
            ctx.restore();
        };

        let animationFrameId: number;

        const draw = () => {
            // Auto rotation + Mouse influence
            pRotate += 0.002;
            rotation.x += (targetRotation.x - rotation.x) * 0.05;
            rotation.y += (targetRotation.y - rotation.y) * 0.05;

            // Clear
            ctx.fillStyle = '#050A14';
            ctx.fillRect(0, 0, width, height);

            // Process Points
            points.forEach(p => {
                if (p.type === 'node') {
                    // Reset to base state rotated by auto-rotation
                    const autoY = pRotate;

                    // Clone base
                    p.x = p.baseX;
                    p.y = p.baseY;
                    p.z = p.baseZ;

                    // Apply rotations
                    rotateY(p, autoY + rotation.x);
                    rotateX(p, rotation.y);
                } else {
                    // Satellite Orbit logic
                    p.phase += p.baseZ; // Speed stored in baseZ
                    const r = p.baseX; // Radius stored in baseX
                    const tilt = p.baseY / 100; // Tilt factor?

                    // Simple equatorial orbit with minor tilt
                    p.x = Math.cos(p.phase) * r;
                    p.z = Math.sin(p.phase) * r;
                    p.y = Math.sin(p.phase) * p.baseY; // Wobbly orbit

                    // Apply global rotation interaction
                    rotateY(p, rotation.x);
                    rotateX(p, rotation.y);
                }
            });

            // Sort by Z for rendering depth
            points.sort((a, b) => b.z - a.z);

            // Draw Connections (Only for nodes)
            ctx.lineWidth = 0.5;

            // Optimization: Only check connections for a subset or use better spatial structure
            // Brute force 300 points is 45000 checks, fine for modern JS.
            // Only draw if Z is similar or close?
            // Actually, visually better to draw lines between projected points?
            // No, 3D distance is correct.

            const projectedPoints = points.map(p => ({ ...p, proj: project(p) }));

            // Draw Lines first (background)
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)'; // Neon Cyan

            for (let i = 0; i < DOT_COUNT; i++) {
                const p1 = points[i];
                if (p1.z < 0 && Math.abs(p1.z) > GLOBE_RADIUS * 0.8) continue; // Skip back faces mostly for clarity

                // Connect to closest 5?
                // Since it's a Fibonacci sphere, indices are somewhat spatially related but not perfectly.
                // Just check distance to next N points to save cycles?
                // Let's do partial brute force - check 'local' neighborhood in array

                // Better: Connect to points that are physically close
                for (let j = i + 1; j < DOT_COUNT; j++) {
                    const p2 = points[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dz = p1.z - p2.z;
                    const distSq = dx * dx + dy * dy + dz * dz;

                    if (distSq < CONNECTION_DIST * CONNECTION_DIST) {
                        const pp1 = projectedPoints[i].proj;
                        const pp2 = projectedPoints[j].proj;

                        // Depth fade
                        const alpha = 1 - Math.sqrt(distSq) / CONNECTION_DIST;
                        // Z-depth fade
                        const zFade = (p1.z + GLOBE_RADIUS) / (GLOBE_RADIUS * 2);

                        ctx.globalAlpha = alpha * zFade * 0.4;
                        ctx.beginPath();
                        ctx.moveTo(pp1.x, pp1.y);
                        ctx.lineTo(pp2.x, pp2.y);
                        ctx.stroke();
                    }
                }
            }
            ctx.globalAlpha = 1;

            // Draw Nodes & Satellites
            projectedPoints.forEach(pData => {
                const { x, y, scale } = pData.proj;

                if (pData.type === 'node') {
                    const alpha = (pData.z + GLOBE_RADIUS) / (GLOBE_RADIUS * 2);
                    ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(x, y, DOT_SIZE * scale, 0, Math.PI * 2);
                    ctx.fill();
                } else if (pData.type === 'satellite' && pData.icon) {
                    drawIcon(ctx, x, y, pData.icon, scale);
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            initGlobe();
        };

        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / width) * 2 - 1;
            const y = (e.clientY / height) * 2 - 1;

            // Mouse affects rotation target slightly (fine control)
            targetRotation.x = x * 0.5;
            targetRotation.y = -y * 0.5;
        };

        const handleScroll = () => {
            // Scroll affects rotation cumulatively or directly
            // Direct mapping: Scroll position maps to Y rotation
            const scrollY = window.scrollY;

            // Add a continuous rotation based on scroll
            // We modify the 'auto rotation' base or the target?
            // Let's add an offset to the target based on scroll
            targetRotation.x += 0.05; // Spin on scroll event (impulse)?

            // Better: Map scrollY to an angle offset
            // This creates a "gear" effect where scrolling down rotates the globe
            pRotate = scrollY * 0.002;
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll); // Listen to scroll

        resize(); // init
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none -z-10"
        />
    );
};

export default BackgroundCanvas;
