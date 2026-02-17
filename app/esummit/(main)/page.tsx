'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiArrowRight, FiTarget, FiTrendingUp, FiActivity, FiCpu, FiGlobe, FiLayers } from 'react-icons/fi';
import GallerySection from '@/components/GallerySection';
import { createClient } from '@/lib/supabase/client';

const ParallaxText = ({ children, baseVelocity = 100 }: { children: string; baseVelocity: number }) => {
    // Simplified marquee for now to reduce complexity in this file, 
    // but we can bring back the full marquee component if needed.
    return (
        <div className="overflow-hidden whitespace-nowrap flex gap-8 py-4 opacity-30">
            <motion.div
                className="text-6xl md:text-9xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-esummit-secondary/20 to-esummit-primary/20"
                animate={{ x: [0, -1000] }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            >
                {children} {children} {children} {children}
            </motion.div>
        </div>
    );
};

const StatCard = ({ value, label, delay }: { value: string, label: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className="relative bg-esummit-card/50 backdrop-blur-md p-8 rounded-2xl border border-esummit-secondary/10 hover:border-esummit-primary/50 transition-colors group text-center"
    >
        <div className="text-5xl md:text-6xl font-black text-esummit-primary mb-2 group-hover:scale-110 transition-transform duration-300 inline-block">
            {value}
        </div>
        <div className="text-esummit-secondary/80 font-medium tracking-widest uppercase text-sm">
            {label}
        </div>
        <div className="absolute -inset-1 bg-gradient-to-r from-esummit-primary/20 to-esummit-accent/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
    </motion.div>
);

const FeatureRow = ({ title, desc, icon: Icon, align = 'left', delay, image_url }: { title: string, desc: string, icon: any, align?: 'left' | 'right', delay: number, image_url?: string }) => (
    <motion.div
        initial={{ opacity: 0, x: align === 'left' ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay }}
        className={`flex flex-col md:flex-row items-center gap-12 ${align === 'right' ? 'md:flex-row-reverse' : ''} mb-24`}
    >
        <div className="flex-1 w-full order-2 md:order-1">
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-esummit-primary to-esummit-accent opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-500 rounded-full" />
                <div className={`h-64 w-full rounded-2xl border border-white/10 bg-esummit-card/50 backdrop-blur-sm flex items-center justify-center overflow-hidden relative z-10`}>
                    {/* Visual Content */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

                    {image_url ? (
                        <img
                            src={image_url}
                            alt={title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <>
                            <Icon className="text-9xl text-white/5 absolute -bottom-8 -right-8 rotate-12" />
                            <div className="text-esummit-accent font-mono text-sm tracking-widest border border-esummit-accent/30 px-4 py-2 rounded uppercase">
                                SYSTEM.INIT({title.toUpperCase().replace(/\s/g, '_')})
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>

        <div className="flex-1 space-y-6 order-1 md:order-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-esummit-primary/10 text-esummit-primary border border-esummit-primary/20">
                <Icon className="text-3xl" />
            </div>
            <div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h3>
                <p className="text-esummit-secondary/60 leading-relaxed text-lg">
                    {desc}
                </p>
            </div>
        </div>
    </motion.div>
);

export default function ESummitPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const [registerLink, setRegisterLink] = useState('/esummit/login'); // Default to login

    // Dynamic Data States
    const [stats, setStats] = useState<any[]>([]);
    const [blueprints, setBlueprints] = useState<any[]>([]);
    const [settings, setSettings] = useState({ show_stats: true, show_blueprint: true });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setRegisterLink('/esummit/events');
            }
        };

        const fetchData = async () => {
            const supabase = createClient();

            // Fetch Stats
            const { data: statsData } = await supabase
                .from('esummit_stats')
                .select('*')
                .order('display_order', { ascending: true });

            if (statsData) setStats(statsData);

            // Fetch Blueprints
            const { data: bpData } = await supabase
                .from('esummit_blueprint')
                .select('*')
                .order('display_order', { ascending: true });

            if (bpData) setBlueprints(bpData);

            // Fetch Settings
            const { data: settingsData } = await supabase
                .from('esummit_settings')
                .select('*')
                .single();

            if (settingsData) {
                setSettings({
                    show_stats: settingsData.show_stats,
                    show_blueprint: settingsData.show_blueprint
                });
            }

            setLoading(false);
        };

        checkAuth();
        fetchData();
    }, []);

    // Parallax Effects
    const yHero = useTransform(scrollYProgress, [0, 0.2], [0, 200]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    return (
        <div ref={containerRef} className="min-h-screen text-white overflow-x-hidden selection:bg-esummit-primary selection:text-esummit-bg font-body">


            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
                <motion.div
                    style={{ y: yHero, opacity: opacityHero }}
                    className="container mx-auto px-4 z-30 text-center relative"
                >
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-esummit-secondary/20 bg-esummit-card/30 backdrop-blur-sm text-sm font-medium text-esummit-secondary tracking-widest mb-8"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-esummit-primary animate-pulse" />
                        MNIT JAIPUR
                    </motion.div>

                    <div className="relative mb-8">
                        <h1 className="text-8xl md:text-[150px] font-black leading-[0.85] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-esummit-secondary to-esummit-secondary/50">
                            VISIONARY
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-esummit-primary via-yellow-200 to-esummit-primary block mt-2">
                                ASCENT
                            </span>
                        </h1>
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                            className="absolute -bottom-4 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-esummit-primary to-transparent"
                        />
                    </div>

                    <p className="text-xl md:text-2xl text-esummit-secondary/70 max-w-2xl mx-auto font-light leading-relaxed mb-12">
                        E-Summit 2026 by E-Cell MNIT. Where ideas take flight and innovation knows no bounds.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link
                            href="/esummit/events"
                            className="group relative px-10 py-5 bg-esummit-primary text-esummit-bg font-black uppercase tracking-widest text-sm hover:bg-yellow-400 transition-colors clip-path-slant"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Explore Events <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </span>
                            {/* Slanted corner effect could be done with clip-path, simplified for now */}
                        </Link>
                        <Link
                            href="/esummit/about"
                            className="px-10 py-5 bg-transparent border border-esummit-secondary/20 text-white font-bold uppercase tracking-widest text-sm hover:bg-white/5 transition-colors"
                        >
                            Our Vision
                        </Link>
                    </div>
                </motion.div>

                {/* Decorative Bottom Fade */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-esummit-bg to-transparent z-20 pointer-events-none" />
            </section>

            {/* Marquee Separator */}
            <div className="relative z-20 bg-esummit-bg/50 backdrop-blur-sm border-y border-white/5 pointer-events-none">
                <ParallaxText baseVelocity={-5}>INNOVATE • DISRUPT • SCALE •</ParallaxText>
            </div>

            {/* Impact/Stats Section */}
            {settings.show_stats && (
                <section className="py-32 relative z-10">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-20">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="max-w-2xl"
                            >
                                <h2 className="text-4xl md:text-6xl font-black mb-6">
                                    BY THE <span className="text-esummit-primary">NUMBERS</span>
                                </h2>
                                <p className="text-esummit-secondary/60 text-lg">
                                    Our legacy of fostering entrepreneurship speaks for itself.
                                </p>
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {stats.length > 0 ? (
                                stats.map((stat, index) => (
                                    <StatCard key={stat.id} value={stat.value} label={stat.label} delay={0.1 * (index + 1)} />
                                ))
                            ) : (
                                // Fallback / Loading skeleton could go here, or just keep hardcoded as default until data exists
                                <>
                                    <StatCard value="10K+" label="Footfall" delay={0.1} />
                                    <StatCard value="50+" label="Speakers" delay={0.2} />
                                    <StatCard value="100+" label="Startups" delay={0.3} />
                                    <StatCard value="₹10L+" label="Grants" delay={0.4} />
                                </>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Features/Strategy Section */}
            {settings.show_blueprint && (
                <section className="py-32 relative z-10 bg-esummit-bg/50">
                    <div className="container mx-auto px-4">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center text-4xl md:text-6xl font-black mb-24"
                        >
                            THE <span className="text-esummit-accent">BLUEPRINT</span>
                        </motion.h2>

                        {blueprints.length > 0 ? (
                            blueprints.map((item, index) => {
                                const ICON_MAP: any = { FiTarget, FiActivity, FiCpu, FiGlobe, FiLayers, FiTrendingUp };
                                const IconComponent = ICON_MAP[item.icon] || FiTarget;
                                return (
                                    <FeatureRow
                                        key={item.id}
                                        title={item.title}
                                        desc={item.description}
                                        icon={IconComponent}
                                        align={item.align}
                                        delay={0.1 * (index + 1)}
                                        image_url={item.image_url}
                                    />
                                );
                            })
                        ) : (
                            <>
                                <FeatureRow
                                    title="Startup Expo"
                                    desc="Showcase your innovation to investors, mentors, and early adopters. The launchpad your startup deserves."
                                    icon={FiTarget}
                                    align="left"
                                    delay={0.1}
                                />
                                <FeatureRow
                                    title="Speaker Sessions"
                                    desc="Gain specialized knowledge from industry veterans who have walked the path and conquered the challenges."
                                    icon={FiActivity}
                                    align="right"
                                    delay={0.2}
                                />
                                <FeatureRow
                                    title="Hackathons"
                                    desc="Build, break, and rebuild. 24 hours of intense coding and problem-solving to create the next big thing."
                                    icon={FiCpu}
                                    align="left"
                                    delay={0.3}
                                />
                                <FeatureRow
                                    title="Networking Arena"
                                    desc="Connect with a curated community of founders, VCs, and tech enthusiasts. Your next co-founder might be here."
                                    icon={FiGlobe}
                                    align="right"
                                    delay={0.4}
                                />
                            </>
                        )}
                    </div>
                </section>
            )}

            {/* Gallery Preview */}
            <GallerySection source="esummit" className="py-20 relative z-10 bg-gradient-to-b from-esummit-bg to-esummit-card/20" />

            {/* CTA Section */}
            <section className="py-40 relative overflow-hidden flex items-center justify-center">
                {/* Warp Speed Effect Background (simulated with radial gradient for now) */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-esummit-primary/10 via-esummit-bg to-esummit-bg" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative z-10 text-center max-w-4xl mx-auto px-4"
                >
                    <h2 className="text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tighter">
                        EXPERIENCE THE <br />
                        <span className="text-esummit-primary drop-shadow-[0_0_20px_rgba(255,184,0,0.5)]">FUTURE</span>
                    </h2>
                    <p className="text-xl text-esummit-secondary/70 mb-12">
                        Join us at E-Summit 2026. Your journey starts here.
                    </p>
                    <Link
                        href={registerLink}
                        className="inline-flex h-16 animate-shimmer items-center justify-center rounded-full border border-esummit-primary/30 bg-[linear-gradient(110deg,#000103,45%,#FFB800,55%,#000103)] bg-[length:200%_100%] px-12 font-bold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-esummit-primary focus:ring-offset-2 focus:ring-offset-esummit-bg text-xl uppercase tracking-widest"
                    >
                        Register Now
                    </Link>
                </motion.div>
            </section>
        </div>
    );
}
