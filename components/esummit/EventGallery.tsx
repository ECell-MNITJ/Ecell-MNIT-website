'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMaximize2 } from 'react-icons/fi';

interface EventGalleryProps {
    gallery: any[];
}

export default function EventGallery({ gallery }: EventGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!gallery || gallery.length === 0) return null;

    return (
        <div>
            <h2 className="text-3xl font-black text-white mb-8 uppercase tracking-wide flex items-center gap-3">
                <span className="w-2 h-8 bg-purple-500 rounded-full" />
                Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((image: any, index: number) => {
                    const imageUrl = typeof image === 'string' ? image : image.url;
                    const caption = typeof image === 'string' ? `Gallery Image ${index + 1}` : image.caption;

                    return (
                        <motion.div
                            key={index}
                            className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group cursor-pointer hover:border-esummit-primary/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)]"
                            onClick={() => setSelectedImage(imageUrl)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <img
                                src={imageUrl}
                                alt={caption || `Gallery Image ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <FiMaximize2 className="text-white text-3xl opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300" />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                            onClick={() => setSelectedImage(null)}
                        >
                            <FiX className="text-2xl" />
                        </button>
                        <motion.img
                            src={selectedImage}
                            alt="Full screen gallery"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl mb-4"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
                        />
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-6 left-0 right-0 text-center text-white text-lg font-medium drop-shadow-md px-4"
                        >
                            {gallery.find(img => (typeof img === 'string' ? img : img.url) === selectedImage)?.caption || ''}
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
