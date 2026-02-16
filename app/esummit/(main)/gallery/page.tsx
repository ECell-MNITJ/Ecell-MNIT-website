'use client';

import GallerySection from '@/components/GallerySection';
import { motion } from 'framer-motion';

export default function ESummitGalleryPage() {
    return (
        <div className="min-h-screen bg-esummit-bg text-white pt-24 pb-20">
            <div className="container mx-auto px-4 text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="text-esummit-accent font-bold tracking-widest uppercase text-sm mb-4 block">
                        Relive The Moments
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6">
                        <span className="text-white">SUMMIT</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-esummit-primary to-esummit-accent">GALLERY</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light">
                        A visual journey through the energy, innovation, and impact of past E-Summits.
                    </p>
                </motion.div>
            </div>

            <GallerySection source="esummit" />
        </div>
    );
}
