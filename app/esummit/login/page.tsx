'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

function ESummitLoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextUrl = searchParams.get('next') || '/esummit/profile';
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            toast.success('Login successful!');
            router.push(nextUrl);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full bg-esummit-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
            <div className="text-center mb-10">
                <Link href="/esummit" className="inline-block mb-6 group">
                    <span className="text-3xl font-black tracking-wider flex items-center justify-center gap-2 group-hover:scale-105 transition-transform duration-300">
                        E-SUMMIT <span className="text-esummit-primary drop-shadow-[0_0_8px_rgba(157,78,221,0.8)]">24</span>
                    </span>
                </Link>
                <h2 className="text-xl font-medium text-gray-300">Welcome Back, Innovator</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
                    <div className="relative">
                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-esummit-bg/50 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-esummit-primary/50 focus:bg-esummit-bg/80 transition-all placeholder:text-gray-600"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 ml-1">Password</label>
                    <div className="relative">
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-esummit-bg/50 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-esummit-primary/50 focus:bg-esummit-bg/80 transition-all placeholder:text-gray-600"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-esummit-primary to-purple-600 text-white font-bold uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(157,78,221,0.4)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Sign In <FiArrowRight />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center text-gray-500 text-sm">
                <p>
                    New to E-Summit?{' '}
                    <Link href="/esummit/signup" className="text-esummit-accent font-bold hover:text-white transition-colors">
                        Create Account
                    </Link>
                </p>
            </div>
        </motion.div>
    );
}

export default function ESummitLogin() {
    return (
        <div className="min-h-screen bg-esummit-bg text-white flex items-center justify-center p-4 overflow-hidden relative font-body selection:bg-esummit-primary selection:text-white">
            <Toaster position="top-right"
                toastOptions={{
                    style: {
                        background: '#0f0b29',
                        color: '#fff',
                        border: '1px solid rgba(157,78,221,0.3)',
                    },
                }}
            />

            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-esummit-primary/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-esummit-accent/5 rounded-full blur-[128px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
            </div>

            <Suspense fallback={<div className="text-white z-10">Loading...</div>}>
                <ESummitLoginForm />
            </Suspense>
        </div>
    );
}
