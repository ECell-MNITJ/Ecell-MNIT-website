'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth/confirmed`,
                },
            });

            if (error) throw error;

            toast.success('Please verify your email to sign in.');
            router.push('/login');
        } catch (error: any) {
            toast.error(error.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-12 flex items-center justify-center p-4">
            <Toaster position="top-right" />

            <div className="max-w-md w-full bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-heading text-primary-golden mb-2">
                        Create Account
                    </h1>
                    <p className="text-gray-400">Join the E-Cell community</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary-golden focus:border-transparent transition-all placeholder-gray-500"
                            placeholder="John Doe"
                        />
                    </div>

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

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary-golden focus:border-transparent transition-all placeholder-gray-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary-golden to-yellow-700 text-black font-bold py-3 rounded-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-700 text-center">
                    <p className="text-gray-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary-golden font-semibold hover:text-white transition-colors">
                            Sign in
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
            </div>
        </div>
    );
}
