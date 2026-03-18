'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import MerchandiseCard from '@/components/esummit/MerchandiseCard';
import CustomCursor from '@/components/esummit/CustomCursor';

interface Product {
    id: string;
    name: string;
    price: string;
    image_url: string | null;
    image_urls: string[] | null;
    category: string | null;
    details_url: string | null;
}

export default function MerchandisePage() {
    const supabase = createClient();
    const [products, setProducts] = useState<Product[]>([]);
    const [buyNowUrl, setBuyNowUrl] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Products
                const { data: productsData } = await supabase
                    .from('esummit_merchandise' as any)
                    .select('*')
                    .order('display_order', { ascending: true });

                if (productsData) setProducts(productsData as any);

                // Fetch Settings (Buy Now URL)
                const { data: settingsData } = await supabase
                    .from('esummit_settings' as any)
                    .select('merchandise_buy_now_url')
                    .single();

                if ((settingsData as any)?.merchandise_buy_now_url) {
                    setBuyNowUrl((settingsData as any).merchandise_buy_now_url);
                }
            } catch (err) {
                console.error('Error fetching merchandise data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [supabase]);

    return (
        <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans selection:bg-purple-500/30 overflow-x-hidden">
            <style jsx global>{`
                @media (hover: hover) {
                    * {
                        cursor: none !important;
                    }
                }
            `}</style>
            <CustomCursor />
            {/* Custom Header */}
            <motion.header 
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 h-20"
            >
                <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
                    <Link
                        href="/esummit"
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                    >
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Home</span>
                    </Link>

                    <div className="flex items-center gap-6">
                        {buyNowUrl && (
                            <Link
                                href={buyNowUrl}
                                target="_blank"
                                className="bg-white hover:bg-[#267ae7] text-black hover:text-white  px-6 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-purple-900/20 active:scale-95"
                            >
                                BUY NOW
                            </Link>
                        )}
                    </div>
                </div>
            </motion.header>

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                {/* Hero Section */}
                <section className="text-center mb-24 relative overflow-hidden px-4 md:px-0">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 2 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-purple-600/10 blur-[80px] md:blur-[120px] -z-10 rounded-full" 
                    />

                    <div>
                        <div className="flex justify-center mb-8">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ 
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 20,
                                    delay: 0.2 
                                }}
                            >
                                <motion.img
                                    animate={{
                                        y: [0, -10, 0],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    src="/images/merch/logo.png"
                                    alt="ES-MERCH Logo"
                                    className="w-32 h-32 md:w-40 md:h-40 object-contain brightness-110 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                                />
                            </motion.div>
                        </div>
                        <motion.h1 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-3xl sm:text-4xl md:text-7xl font-black mb-6 tracking-normal"
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] via-[#60a5fa] to-[#032773]">
                                E-Cell X
                            </span>
                            <span className="text-white ml-2 md:ml-4">The Dopamine Store</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed"
                        >
                            Premium limited-edition apparel designed for the founders, creators, and rebels of the 10th edition.
                        </motion.p>
                    </div>
                </section>

                {/* Product Grid */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500 animate-pulse">Loading the drop...</div>
                ) : products.length > 0 ? (
                    <section className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-8 gap-y-10 sm:gap-y-16">
                        {products.map((product, idx) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ 
                                    duration: 0.6,
                                    delay: 0.8 + (idx * 0.1),
                                    ease: [0.2, 0.8, 0.2, 1]
                                }}
                            >
                                <MerchandiseCard product={product} />
                            </motion.div>
                        ))}
                    </section>
                ) : (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                        <FiShoppingBag className="mx-auto text-4xl text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-white">Soon dropping...</h3>
                        <p className="text-gray-500">The first drop of F'10 is being finalized. Stay tuned.</p>
                    </div>
                )}


            </main>

            <motion.footer 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.5 }}
                className="py-12 border-t border-white/5 text-center text-xs text-gray-600 uppercase tracking-widest font-bold"
            >
                E-Summit MNITJ &copy; 2026 // ESTABLISHED IN 2026
            </motion.footer>
        </div>
    );
}
