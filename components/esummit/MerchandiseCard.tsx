'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShoppingCart, FiShoppingBag } from 'react-icons/fi';

interface Product {
    id: string;
    name: string;
    price: string;
    image_url: string | null;
    category: string | null;
    details_url?: string | null;
}

export default function MerchandiseCard({ product }: { product: Product }) {
    const DetailsButton = (
        <button className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white text-black font-medium text-[8px] sm:text-[10px] uppercase tracking-widest rounded-full hover:bg-esummit-primary hover:text-white transition-all duration-300">
            Details <FiArrowRight className="text-[10px] sm:text-xs" />
        </button>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative bg-gradient-to-b from-white/[0.08] to-white/[0.01] backdrop-blur-2xl rounded-3xl md:rounded-[2.5rem] border border-white/[0.12] overflow-hidden hover:border-esummit-primary/50 transition-all duration-500 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]"
        >
            {/* Product Image Container */}
            <div className="relative aspect-[4/5] max-h-[400px] md:max-h-none overflow-hidden bg-white/[0.02]">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-all duration-700"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                        <FiShoppingBag size={48} />
                    </div>
                )}

                {/* Overlay with category badge */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                    <span className="text-esummit-primary text-xs font-black uppercase tracking-widest mb-2 px-3 py-1 bg-esummit-primary/10 rounded-full w-fit backdrop-blur-sm border border-esummit-primary/20">
                        {product.category}
                    </span>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-3 sm:p-5 space-y-1.5 sm:space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-sm sm:text-lg font-bold text-white group-hover:text-esummit-primary transition-colors line-clamp-1 tracking-wider">
                            {product.name}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-x-2 gap-y-2 pt-2 border-t border-white/5">
                    <div className="text-sm sm:text-md font-medium text-white shrink-0">
                        <span className="text-esummit-primary text-[10px] sm:text-sm mr-1">₹</span>
                        {product.price}
                    </div>

                    {product.details_url ? (
                        <a
                            href={product.details_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 ml-auto"
                        >
                            {DetailsButton}
                        </a>
                    ) : (
                        <div className="shrink-0 ml-auto">
                            {DetailsButton}
                        </div>
                    )}
                </div>
            </div>

            {/* Subtle glow effect on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-esummit-primary/20 to-esummit-accent/20 rounded-[32px] blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
        </motion.div>
    );
}
