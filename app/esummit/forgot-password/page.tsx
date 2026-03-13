'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiMail, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

export default function ESummitForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const supabase = createClient();

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/esummit/reset-password`,
            });

            if (error) throw error;

            toast.success('Reset link sent to your email!');
            setSubmitted(true);
        } catch (error: any) {
            toast.error(error.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

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

            <Link
                href="/esummit/login"
                className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors z-20 group font-medium"
            >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                Back to Login
            </Link>

            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-esummit-primary/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-esummit-accent/5 rounded-full blur-[128px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-esummit-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
                {!submitted ? (
                    <>
                        <div className="text-center mb-10">
                            <Link href="/esummit" className="inline-block mb-6 group">
                                <span className="text-3xl font-black tracking-wider flex items-center justify-center gap-2 group-hover:scale-105 transition-transform duration-300">
                                    E-SUMMIT <span className="text-esummit-primary drop-shadow-[0_0_8px_rgba(157,78,221,0.8)]">26</span>
                                </span>
                            </Link>
                            <h2 className="text-xl font-medium text-gray-300">
                                Reset Your Password
                            </h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleResetRequest} className="space-y-6">
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-esummit-primary text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-white hover:shadow-[0_0_20px_rgba(255,184,0,0.4)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Send Reset Link <FiArrowRight />
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-esummit-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiMail className="text-4xl text-esummit-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
                        <p className="text-gray-400 mb-8">
                            We&apos;ve sent a password reset link to <span className="text-white font-medium">{email}</span>. Please check your inbox and spam folder.
                        </p>
                        <div className="bg-esummit-primary/10 border border-esummit-primary/20 rounded-xl p-4 mb-8 text-sm text-left">
                            <p className="text-esummit-primary font-bold mb-1">Cross-device reset?</p>
                            <p className="text-gray-400">
                                If you&apos;re checking email on a different device, you can use the 6-digit code from the email on the next page.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <Link
                                href={`/esummit/reset-password?email=${encodeURIComponent(email)}`}
                                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-esummit-primary transition-all flex items-center justify-center gap-2"
                            >
                                Enter Verification Code <FiArrowRight />
                            </Link>
                            <Link
                                href="/esummit/login"
                                className="inline-flex items-center justify-center gap-2 text-gray-500 hover:text-white transition-colors"
                            >
                                <FiArrowLeft /> Back to Sign In
                            </Link>
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>
                        Remember your password?{' '}
                        <Link href="/esummit/login" className="text-esummit-accent font-bold hover:text-white transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
