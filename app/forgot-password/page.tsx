'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const supabase = createClient();

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
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
        <div className="min-h-screen pt-32 pb-12 flex items-center justify-center p-4 bg-black">
            <div className="max-w-md w-full bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10">
                {!submitted ? (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-heading text-primary-golden mb-2">
                                Reset Password
                            </h1>
                            <p className="text-gray-400">Enter your email for a reset link</p>
                        </div>

                        <form onSubmit={handleResetRequest} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary-golden focus:border-transparent transition-all placeholder-gray-500"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-primary-golden to-yellow-700 text-black font-bold py-3 rounded-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="mb-6">
                            <svg className="w-20 h-20 text-primary-golden mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-primary-golden mb-4">Check Your Email</h2>
                        <p className="text-gray-400 mb-6">
                            We&apos;ve sent a password reset link to <span className="text-white font-medium">{email}</span>.
                        </p>
                        <div className="bg-primary-golden/10 border border-primary-golden/20 rounded-xl p-4 mb-8 text-sm text-left">
                            <p className="text-primary-golden font-bold mb-1">Cross-device reset?</p>
                            <p className="text-gray-300">
                                If you&apos;re checking email on a different device, you can use the 6-digit code from the email on the next page.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <Link
                                href={`/reset-password?email=${encodeURIComponent(email)}`}
                                className="w-full bg-primary-golden text-black font-bold py-3 rounded-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                Enter Verification Code
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm">
                    <p className="text-gray-400">
                        Remember your password?{' '}
                        <Link href="/login" className="text-primary-golden font-semibold hover:text-white transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
