'use client';

import { motion } from 'framer-motion';
import { FiTarget, FiTrendingUp, FiUsers, FiAward } from 'react-icons/fi';

export default function VisionPage() {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const stagger = {
        visible: { transition: { staggerChildren: 0.2 } }
    };

    return (
        <div className="min-h-screen text-white pt-32 pb-20">
            {/* Hero Section */}
            <motion.section
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="container mx-auto px-6 mb-24 text-center relative z-10"
            >
                <motion.h1
                    variants={fadeIn}
                    className="text-5xl md:text-8xl font-black mb-6 tracking-tighter"
                >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 mr-4">
                        OUR
                    </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-esummit-primary via-yellow-400 to-esummit-primary">
                        VISION
                    </span>
                </motion.h1>
                <motion.p
                    variants={fadeIn}
                    className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
                >
                    Empowering the next generation of leaders to build a legacy of innovation/
                </motion.p>
            </motion.section>

            {/* Vision & Mission Split */}
            <section className="container mx-auto px-6 mb-32">
                <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-heading text-white mb-8 border-l-4 border-esummit-primary pl-6">
                            The Vision
                        </h2>
                        <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                            <p>
                                At E-Cell MNIT, we envision a world where every student has the courage to dream and the tools to build. We aim to be the catalyst that transforms raw potential into impactful ventures.
                            </p>
                            <p>
                                Our vision extends beyond campus walls. We strive to create a thriving ecosystem of entrepreneurship that contributes significantly to the nation's economic growth and social development.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="bg-gray-900/50 p-10 rounded-3xl border border-white/10 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-esummit-primary/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-esummit-primary/20 transition-colors duration-700"></div>

                        <h2 className="text-3xl md:text-5xl font-heading text-white mb-8 relative z-10">
                            The Mission
                        </h2>
                        <ul className="space-y-6 relative z-10">
                            {[
                                { icon: FiTarget, text: "To foster an entrepreneurial mindset among students." },
                                { icon: FiTrendingUp, text: "To provide mentorship, resources, and funding opportunities." },
                                { icon: FiUsers, text: "To build a strong network of industry leaders and alumni." }
                            ].map((item, index) => (
                                <li key={index} className="flex items-start gap-4">
                                    <div className="p-3 bg-gray-800 rounded-xl text-esummit-primary">
                                        <item.icon size={24} />
                                    </div>
                                    <span className="text-lg text-gray-300 mt-2">{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </section>

            {/* Core Values */}
            <section className="container mx-auto px-6 mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-heading text-white mb-6">Core Values</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-esummit-primary to-transparent mx-auto"></div>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "Innovation",
                            desc: "We believe in breaking boundaries and challenging the status quo to create novel solutions.",
                            delay: 0
                        },
                        {
                            title: "Integrity",
                            desc: "We uphold the highest standards of honesty and ethical behavior in all our endeavors.",
                            delay: 0.2
                        },
                        {
                            title: "Impact",
                            desc: "We focus on creating sustainable value that makes a tangible difference in society.",
                            delay: 0.4
                        }
                    ].map((val, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: val.delay }}
                            className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-esummit-primary/50 transition-colors duration-300 hover:-translate-y-2 group"
                        >
                            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-esummit-primary transition-colors">
                                {val.title}
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                {val.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
