'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextUrl = searchParams.get('next') || '/profile';
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isResettingPassword) {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                });

                if (error) throw error;

                toast.success('Password reset link sent to your email!');
                setIsResettingPassword(false);
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                toast.success('Login successful!');
                router.push(nextUrl);
                router.refresh();
            }
        } catch (error: any) {
            toast.error(error.message || (isResettingPassword ? 'Failed to send reset email' : 'Login failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleLogin} className="space-y-6">
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

                {!isResettingPassword && (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsResettingPassword(true)}
                                className="text-xs text-primary-golden hover:text-white transition-colors"
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required={!isResettingPassword}
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary-golden focus:border-transparent transition-all placeholder-gray-500"
                            placeholder="••••••••"
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary-golden to-yellow-700 text-black font-bold py-3 rounded-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (isResettingPassword ? 'Sending...' : 'Signing in...') : (isResettingPassword ? 'Send Reset Link' : 'Sign In')}
                </button>

                {isResettingPassword && (
                    <button
                        type="button"
                        onClick={() => setIsResettingPassword(false)}
                        className="w-full text-sm text-gray-400 hover:text-white transition-colors text-center mt-4"
                    >
                        Back to Login
                    </button>
                )}
            </form>

            <div className="mt-8 pt-6 border-t border-gray-700 text-center">
                <p className="text-gray-400">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-primary-golden font-semibold hover:text-white transition-colors">
                        Sign up
                    </Link>
                </p>
                <div className="mt-4">
                    <Link
                        href="/"
                        className="inline-flex items-center text-gray-500 hover:text-primary-golden transition-colors text-sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Website
                    </Link>
                </div>
            </div>
        </>
    );
}

export default function Login() {
    return (
        <div className="min-h-screen pt-32 pb-12 flex items-center justify-center p-4">
            <Toaster position="top-right" />
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <div className="max-w-md w-full bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-heading text-primary-golden mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-gray-400">Sign in to your account</p>
                    </div>

                    <LoginForm />
                </div>
            </Suspense>
        </div>
    );
}
