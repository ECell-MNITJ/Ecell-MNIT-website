'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { MdEmail, MdArrowForward, MdHome, MdRefresh } from 'react-icons/md';
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
            router.push('/complete-profile');
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
        <div className="min-h-screen pt-32 pb-12 flex items-center justify-center p-4">
            <Toaster position="top-right" />
            <div className="max-w-md w-full bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10 text-center">
                <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-primary-golden/10 rounded-full border border-primary-golden/20">
                        <MdEmail className="w-12 h-12 text-primary-golden animate-pulse" />
                    </div>
                </div>

                <h1 className="text-3xl font-heading text-primary-golden mb-4">
                    Verify Your Account
                </h1>

                <p className="text-gray-300 mb-8 leading-relaxed">
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
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-4 text-center text-3xl font-black tracking-[0.5em] text-primary-golden focus:outline-none focus:border-primary-golden/50 focus:bg-gray-900/80 transition-all placeholder:text-gray-700 placeholder:tracking-normal placeholder:text-lg"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !otp || otp.length < 6}
                        className="w-full inline-flex items-center justify-center bg-gradient-to-r from-primary-golden to-yellow-700 text-black font-bold py-3 px-6 rounded-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying...' : 'Verify Code'}
                        <MdArrowForward className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 flex flex-col gap-4 items-center">
                    <button
                        onClick={handleResend}
                        disabled={resending || !email}
                        className="text-gray-400 hover:text-primary-golden transition-colors text-sm flex items-center gap-2"
                    >
                        <MdRefresh className={`${resending ? 'animate-spin' : ''}`} />
                        {resending ? 'Resending...' : "Didn't receive the code? Resend"}
                    </button>

                    <Link
                        href="/"
                        className="text-gray-500 hover:text-gray-300 transition-colors text-sm flex items-center gap-2"
                    >
                        <MdHome className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmail() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-golden"></div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
