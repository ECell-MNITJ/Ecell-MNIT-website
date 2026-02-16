'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { loginAction } from '@/app/actions/auth';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        const result = await loginAction(formData, 'admin');

        if (result.success) {
            toast.success('Login successful!');
            // Use window.location.href to force a full reload and ensure cookies are picked up
            window.location.href = result.redirectUrl || '/admin/dashboard';
        } else {
            toast.error(result.error || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-green via-gray-900 to-primary-green flex items-center justify-center p-4">
            <Toaster position="top-right" />

            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-heading text-primary-green mb-2">
                        E-CELL <span className="text-primary-golden">ADMIN</span>
                    </h1>
                    <p className="text-gray-600">Sign in to manage your website</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent transition-all"
                            placeholder="admin@ecell.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary-golden to-yellow-700 text-white font-semibold py-3 rounded-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <Link
                        href="/"
                        className="flex items-center justify-center text-gray-600 hover:text-primary-golden transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Website
                    </Link>
                </div>
            </div>
        </div>
    );
}
