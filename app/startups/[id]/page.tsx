'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Database } from '@/lib/supabase/types';
import { motion } from 'framer-motion';
import { FiGlobe, FiCalendar, FiUsers, FiArrowLeft, FiExternalLink } from 'react-icons/fi';

type Startup = Database['public']['Tables']['startups']['Row'];

export default function StartupDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [startup, setStartup] = useState<Startup | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = useMemo(() => createClient(), []);
    const id = params.id as string;

    useEffect(() => {
        if (!id) return;

        const fetchStartup = async () => {
            try {
                const { data, error } = await supabase
                    .from('startups')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    console.error('Error fetching startup:', error);
                    // Redirect to 404 or list page on error? For now staying on page
                } else {
                    setStartup(data);
                }
            } catch (error) {
                console.error('Unexpected error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStartup();
    }, [id, supabase]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-golden"></div>
            </div>
        );
    }

    if (!startup) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white px-4">
                <h2 className="text-3xl font-bold mb-4">Startup Not Found</h2>
                <p className="text-gray-400 mb-8">The startup you are looking for does not exist or has been removed.</p>
                <Link href="/startups" className="px-6 py-3 bg-primary-golden text-black font-bold rounded-full hover:bg-yellow-500 transition-colors">
                    Back to Startups
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-32 px-4 md:px-10 text-white pb-20">
            <div className="max-w-5xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/startups"
                    className="inline-flex items-center text-gray-400 hover:text-primary-golden transition-colors mb-10 group"
                >
                    <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to All Startups
                </Link>

                <div className="grid md:grid-cols-3 gap-10 lg:gap-16">
                    {/* Left Column: Logo & Quick Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="col-span-1"
                    >
                        <div className="bg-zinc-900/50 backdrop-blur-md rounded-3xl border border-zinc-800 p-8 flex flex-col items-center text-center shadow-xl sticky top-28">
                            <div className="w-40 h-40 bg-white rounded-full p-4 flex items-center justify-center shadow-2xl mb-6 ring-4 ring-primary-golden/10">
                                {startup.logo_url ? (
                                    <img
                                        src={startup.logo_url}
                                        alt={startup.name}
                                        className="w-full h-full object-contain rounded-full"
                                    />
                                ) : (
                                    <span className="text-5xl font-bold text-gray-800">{startup.name.charAt(0)}</span>
                                )}
                            </div>

                            <h1 className="text-2xl font-bold font-heading mb-2">{startup.name}</h1>
                            <div className="w-16 h-1 bg-primary-golden rounded-full mb-6"></div>

                            {/* Quick Stats */}
                            <div className="w-full space-y-4 text-left">
                                {startup.founded_year && (
                                    <div className="flex items-center p-3 bg-black/30 rounded-xl border border-white/5">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mr-3 text-primary-golden">
                                            <FiCalendar />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider">Founded</p>
                                            <p className="font-semibold">{startup.founded_year}</p>
                                        </div>
                                    </div>
                                )}

                                {startup.founder_names && (
                                    <div className="flex items-center p-3 bg-black/30 rounded-xl border border-white/5">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mr-3 text-primary-golden">
                                            <FiUsers />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider">Founders</p>
                                            <p className="font-semibold text-sm">{startup.founder_names}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {startup.website_url && (
                                <a
                                    href={startup.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full mt-8 bg-primary-golden text-black py-3 px-6 rounded-xl font-bold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 group"
                                >
                                    <FiGlobe /> Visit Website <FiExternalLink className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </a>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Column: Detailed Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="md:col-span-2"
                    >
                        <div className="bg-zinc-900/30 backdrop-blur-md rounded-3xl border border-zinc-800/50 p-8 md:p-10 min-h-[500px]">
                            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8 flex items-center gap-3">
                                About <span className="text-primary-golden">{startup.name}</span>
                            </h2>

                            <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed">
                                {startup.description ? (
                                    startup.description.split('\n').map((paragraph, idx) => (
                                        paragraph.trim() && <p key={idx} className="mb-6">{paragraph}</p>
                                    ))
                                ) : (
                                    <p className="italic text-gray-500">No description provided for this startup yet.</p>
                                )}
                            </div>

                            {/* Additional potential sections can go here (Timeline, Achievements, etc.) */}
                            <div className="mt-12 pt-8 border-t border-zinc-800">
                                <h3 className="text-xl font-bold mb-4 text-white">Why it matters?</h3>
                                <p className="text-gray-400">
                                    This startup is part of MNIT's vibrant ecosystem, solving real-world challenges through innovation.
                                    By supporting ventures like {startup.name}, E-Cell continues to foster a culture of entrepreneurship.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
