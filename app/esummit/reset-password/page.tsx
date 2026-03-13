'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiLock, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

export default function ESummitResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const email = searchParams?.get('email') || '';

    useEffect(() => {
        // Check if we have an active recovery session (from magic link click)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session && !email) {
                setShowOtp(true);
            }
        };
        checkSession();
    }, [supabase, email]);

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            // If user provided an OTP code, verify it first to establish a session
            if (otpCode && email) {
                const { error: verifyError } = await supabase.auth.verifyOtp({
                    email,
                    token: otpCode,
                    type: 'recovery',
                });
                if (verifyError) throw verifyError;
            }

            // Now update the password
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            toast.success('Password updated successfully!');
            setTimeout(() => {
                router.push('/esummit/login');
            }, 2000);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update password');
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
                <div className="text-center mb-10">
                    <Link href="/esummit" className="inline-block mb-6 group">
                        <span className="text-3xl font-black tracking-wider flex items-center justify-center gap-2 group-hover:scale-105 transition-transform duration-300">
                            E-SUMMIT <span className="text-esummit-primary drop-shadow-[0_0_8px_rgba(157,78,221,0.8)]">26</span>
                        </span>
                    </Link>
                    <h2 className="text-xl font-medium text-gray-300">
                        {otpCode || (email && showOtp) ? 'Verify & Reset' : 'Create New Password'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        {email ? `Updating for ${email}` : 'Enter your new secure password below.'}
                    </p>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    {email && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 ml-1">6-Digit Verification Code</label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                                <input
                                    type="text"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    className="w-full bg-esummit-bg/50 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-esummit-primary/50 focus:bg-esummit-bg/80 transition-all placeholder:text-gray-600 tracking-[0.5em] font-mono text-center"
                                    placeholder="000000"
                                    maxLength={6}
                                />
                            </div>
                            <p className="text-[10px] text-gray-600 ml-1">
                                Optional: Only needed if you didn&apos;t click the link on this device.
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">New Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full bg-esummit-bg/50 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-esummit-primary/50 focus:bg-esummit-bg/80 transition-all placeholder:text-gray-600"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">Confirm New Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full bg-esummit-bg/50 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-esummit-primary/50 focus:bg-esummit-bg/80 transition-all placeholder:text-gray-600"
                                placeholder="••••••••"
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
                                Update Password <FiArrowRight />
                            </>
                        )}
                    </button>
                </form>

                {!email && !loading && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-xs text-red-400 text-center">
                            No active reset session found. Please click the link in your email or start over.
                        </p>
                    </div>
                )}

                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>
                        Back to{' '}
                        <Link href="/esummit/login" className="text-esummit-accent font-bold hover:text-white transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
