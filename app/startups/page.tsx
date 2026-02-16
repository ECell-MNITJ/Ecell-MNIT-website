'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Database } from '@/lib/supabase/types';
import { motion } from 'framer-motion';


type Startup = Database['public']['Tables']['startups']['Row'];

export default function StartupsPage() {
    const [startups, setStartups] = useState<Startup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        const fetchStartups = async () => {
            try {
                const { data, error } = await supabase
                    .from('startups')
                    .select('*')
                    .eq('status', 'active')
                    .order('name', { ascending: true });

                if (error) {
                    console.error('Error fetching startups:', error);
                } else {
                    setStartups(data || []);
                }
            } catch (error) {
                console.error('Unexpected error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStartups();
    }, [supabase]);

    return (
        <main className="min-h-screen pt-32 px-4 md:px-10 text-white relative pb-20">

            <div className="max-w-7xl mx-auto mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">
                        Our <span className="text-primary-golden">Startups</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Discover the innovative ventures incubated at E-Cell MNIT. From tech solutions to sustainable ideas, explore the future being built here.
                    </p>
                </motion.div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-golden"></div>
                    </div>
                ) : startups.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                        {startups.map((startup, index) => (
                            <motion.div
                                key={startup.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <Link
                                    href={`/startups/${startup.id}`}
                                    className="group bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-800 hover:border-primary-golden/50 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_-10px_rgba(212,175,55,0.2)] h-full flex flex-col"
                                >
                                    <div className="h-48 bg-gradient-to-br from-zinc-800 to-black p-6 flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-golden/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                        <div className="w-24 h-24 bg-white rounded-full p-2 flex items-center justify-center shadow-xl z-10 group-hover:scale-110 transition-transform duration-300">
                                            {startup.logo_url ? (
                                                <img
                                                    src={startup.logo_url}
                                                    alt={startup.name}
                                                    className="w-full h-full object-contain rounded-full"
                                                />
                                            ) : (
                                                <span className="text-3xl font-bold text-gray-800">{startup.name.charAt(0)}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-primary-golden transition-colors">{startup.name}</h2>
                                        {startup.founder_names ? (
                                            <p className="text-sm text-gray-400 mb-3 line-clamp-1">
                                                By: <span className="text-gray-300">{startup.founder_names}</span>
                                            </p>
                                        ) : null}
                                        <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                            {startup.description || "Building the future, one step at a time."}
                                        </p>

                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="text-primary-golden text-sm font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-2">
                                                View Details <i className="fas fa-arrow-right"></i>
                                            </span>
                                            {startup.founded_year && (
                                                <span className="text-xs text-zinc-500 px-2 py-1 rounded bg-zinc-800/50 border border-zinc-700">
                                                    Est. {startup.founded_year}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-zinc-800">
                        <p className="text-xl text-gray-400">No startups found at the moment.</p>
                        <p className="text-sm text-gray-500 mt-2">Check back soon for updates!</p>
                    </div>
                )}
            </div>
        </main>
    );
}
