'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { MdEmail, MdArrowForward, MdHome, MdRefresh } from 'react-icons/md';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (!email) {
            toast.error('Email not found. Please sign up again.');
        }
    }, [email]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) {
            toast.error('Please enter a valid verification code');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.verifyOtp({
                email: email.trim(),
                token: otp.trim(),
                type: 'email',
            });

            if (error) throw error;

            toast.success('Email verified successfully!');
            router.push('/esummit/login');
        } catch (error: any) {
            toast.error(error.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });

            if (error) throw error;
            toast.success('Verification code resent!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to resend code');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-12 flex items-center justify-center p-4 bg-esummit-background text-white">
            <Toaster position="top-right" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-esummit-card/80 backdrop-blur-xl rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] p-8 border border-esummit-primary/20 text-center"
            >
                <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-esummit-primary/10 rounded-full border border-esummit-primary/20">
                        <MdEmail className="w-12 h-12 text-esummit-primary animate-pulse" />
                    </div>
                </div>

                <h1 className="text-3xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-esummit-primary to-esummit-accent mb-4">
                    Verify Your Account
                </h1>

                <p className="text-esummit-secondary/70 mb-8 leading-relaxed font-light">
                    We've sent a 6-digit verification code to <br />
                    <span className="font-bold text-white">{email}</span>
                </p>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            maxLength={8}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="· · · · · · · ·"
                            className="w-full bg-esummit-bg/50 border border-white/10 rounded-xl px-4 py-4 text-center text-3xl font-black tracking-[0.5em] text-esummit-primary focus:outline-none focus:border-esummit-primary/50 focus:bg-esummit-bg/80 transition-all placeholder:text-gray-700 placeholder:tracking-normal placeholder:text-lg"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !otp || otp.length < 6}
                        className="w-full inline-flex items-center justify-center bg-gradient-to-r from-esummit-primary to-esummit-accent text-white font-bold py-3 px-6 rounded-lg hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:scale-[1.02] transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Verify Code
                                <MdArrowForward className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 flex flex-col gap-4 items-center">
                    <button
                        onClick={handleResend}
                        disabled={resending || !email}
                        className="text-esummit-secondary/50 hover:text-esummit-primary transition-colors text-sm flex items-center gap-2"
                    >
                        <MdRefresh className={`${resending ? 'animate-spin' : ''}`} />
                        {resending ? 'Resending...' : "Didn't receive the code? Resend"}
                    </button>

                    <Link
                        href="/esummit"
                        className="text-esummit-secondary/30 hover:text-esummit-secondary transition-colors text-sm flex items-center gap-2"
                    >
                        <MdHome className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

export default function VerifyEmail() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-esummit-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-esummit-primary"></div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
