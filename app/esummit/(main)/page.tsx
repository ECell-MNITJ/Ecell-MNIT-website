'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiArrowRight, FiCalendar, FiUsers, FiAward, FiTarget, FiTrendingUp, FiMic } from 'react-icons/fi';
import GallerySection from '@/components/GallerySection';

const Marquee = () => {
    return (
        <div className="relative flex overflow-x-hidden bg-esummit-primary/10 py-4 border-y border-esummit-primary/20 backdrop-blur-sm transform -rotate-1">
            <div className="animate-marquee whitespace-nowrap flex gap-8 text-2xl font-black text-esummit-primary/50 uppercase tracking-widest">
                <span>Innovation</span>
                <span>•</span>
                <span>Entrepreneurship</span>
                <span>•</span>
                <span>Opportunity</span>
                <span>•</span>
                <span>Networking</span>
                <span>•</span>
                <span>Growth</span>
                <span>•</span>
                <span>Incubation</span>
                <span>•</span>
                <span>Startups</span>
                <span>•</span>
                <span>Funding</span>
                <span>•</span>
                <span>Impact</span>
                <span>•</span>
                <span>Innovation</span>
                <span>•</span>
                <span>Entrepreneurship</span>
                <span>•</span>
                <span>Opportunity</span>
                <span>•</span>
                <span>Networking</span>
                <span>•</span>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay }}
            className="group p-8 rounded-3xl bg-esummit-card/40 border border-white/5 hover:border-esummit-primary/50 hover:bg-esummit-card/80 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(157,78,221,0.3)]"
        >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-esummit-primary/20 to-esummit-accent/5 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-500 text-esummit-accent">
                <Icon />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-esummit-accent transition-colors">{title}</h3>
            <p className="text-gray-400 leading-relaxed font-light">{desc}</p>
        </motion.div>
    );
};

export default function ESummitPage() {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
    const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

    return (
        <div ref={targetRef} className="bg-esummit-bg min-h-screen text-white overflow-x-hidden selection:bg-esummit-primary selection:text-white font-body">

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-esummit-card via-esummit-bg to-esummit-bg opacity-80" />
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-esummit-primary/20 rounded-full blur-[128px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-esummit-accent/10 rounded-full blur-[128px]"
                    />

                    {/* Grid */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                </div>

                <motion.div
                    style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
                    className="container mx-auto px-4 relative z-10 text-center"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 py-1.5 px-6 rounded-full bg-white/5 border border-white/10 text-esummit-accent text-sm font-bold tracking-[0.2em] uppercase mb-8 backdrop-blur-md hover:border-esummit-accent/50 transition-colors cursor-default"
                    >
                        <span className="w-2 h-2 rounded-full bg-esummit-accent animate-pulse" />
                        E-Cell MNIT Jaipur Presents
                    </motion.div>

                    <h1 className="text-7xl md:text-[120px] font-black mb-6 tracking-tighter leading-[0.9]">
                        <motion.span
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="block text-white drop-shadow-2xl"
                        >
                            E-SUMMIT
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="block text-transparent bg-clip-text bg-gradient-to-r from-esummit-primary via-white to-esummit-accent pb-4"
                        >
                            2024
                        </motion.span>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12 font-light"
                    >
                        The flagship entrepreneurship summit where <span className="text-esummit-accent font-medium glow-text">innovation</span> meets <span className="text-esummit-primary font-medium glow-text">opportunity</span>.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="flex flex-col sm:flex-row justify-center gap-6"
                    >
                        <Link
                            href="/esummit/events"
                            className="group relative px-10 py-5 bg-white text-black font-black uppercase tracking-widest rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Explore Events <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>

                        <Link
                            href="/esummit/about"
                            className="px-10 py-5 bg-transparent border border-white/20 text-white font-bold uppercase tracking-widest rounded-full hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-sm"
                        >
                            Learn More
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            <Marquee />

            {/* Features Stats */}
            <section className="py-32 relative z-10">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="max-w-2xl"
                        >
                            <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                                UNLEASH YOUR <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-esummit-primary to-esummit-accent">POTENTIAL</span>
                            </h2>
                            <p className="text-gray-400 text-lg">
                                Experience a convergence of brilliant minds, disruptive ideas, and limitless possibilities.
                                E-Summit is not just an event; it's a movement.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="hidden md:block"
                        >
                            <FiTrendingUp className="text-9xl text-white/5 rotate-12" />
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={FiCalendar}
                            title="2 Days of Innovation"
                            desc="Immerse yourself in 48 hours of non-stop entrepreneurial action, workshops, and networking."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={FiUsers}
                            title="50+ Speakers"
                            desc="Learn from the industry titans, successful founders, and visionaries shaping the future."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={FiAward}
                            title="₹10 Lakh+ Prizes"
                            desc="Compete in high-stakes competitions and win big while showcasing your innovative ideas."
                            delay={0.3}
                        />
                        <FeatureCard
                            icon={FiTarget}
                            title="Incubation"
                            desc="Get a chance to be incubated by top incubators and accelerators in the country."
                            delay={0.4}
                        />
                        <FeatureCard
                            icon={FiTrendingUp}
                            title="Networking"
                            desc="Network with like-minded individuals, investors, and mentors to grow your startup."
                            delay={0.5}
                        />
                        <FeatureCard
                            icon={FiMic}
                            title="Workshops"
                            desc="Learn new skills and technologies from experts in hands-on workshops."
                            delay={0.6}
                        />
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <GallerySection source="esummit" className="py-20 relative z-10" />

            {/* CTA Section */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-esummit-primary/5" />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                    className="absolute -left-20 top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-esummit-primary/10 to-transparent rounded-full blur-[100px]"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="container mx-auto px-4 relative z-10 text-center"
                >
                    <h2 className="text-5xl md:text-8xl font-black mb-10 text-white tracking-tighter">
                        READY TO <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-esummit-accent to-white">DOMINATE?</span>
                    </h2>
                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                        Don't miss the biggest entrepreneurship summit of the year. Secure your spot now.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block px-14 py-6 bg-gradient-to-r from-esummit-primary to-purple-800 text-white font-black uppercase tracking-widest rounded-full hover:shadow-[0_0_50px_rgba(157,78,221,0.5)] hover:scale-105 transition-all duration-300 text-lg"
                    >
                        Register Now
                    </Link>
                </motion.div>
            </section>
        </div>
    );
}
