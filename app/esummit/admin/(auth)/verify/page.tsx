'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { FiLock } from 'react-icons/fi';

export default function ESummitAdminVerify() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Check password against environment variable
            // Prioritize E-Summit specific password, fall back to general one
            const adminPassword = process.env.NEXT_PUBLIC_ESUMMIT_ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PANEL_PASSWORD;

            if (!adminPassword) {
                console.warn('E-Summit Admin password not configured, falling back or failing safely.');
                // You might want to handle this case more gracefully or setup the env var
            }

            if (!adminPassword) {
                throw new Error('Admin panel configuration error. Please contact support.');
            }

            if (password === adminPassword) {
                // Set verification cookie
                document.cookie = 'esummit-admin-verified=true; path=/; max-age=86400; SameSite=Strict';
                toast.success('Access granted!');
                router.push('/esummit/admin/dashboard');
                router.refresh();
            } else {
                throw new Error('Incorrect admin panel password');
            }
        } catch (error: any) {
            toast.error(error.message || 'Verification failed');
            setPassword('');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        router.push('/esummit/admin/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-purple-900 flex items-center justify-center p-4">
            <Toaster position="top-right" />

            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-purple-500/20">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                        <FiLock className="w-8 h-8 text-purple-600" />
                    </div>
                    <h1 className="text-3xl font-heading text-purple-900 mb-2">
                        E-Summit Admin Access
                    </h1>
                    <p className="text-gray-600">Enter the admin password to continue</p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-2">
                            Admin Password
                        </label>
                        <input
                            id="admin-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoFocus
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying...' : 'Verify Access'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={handleLogout}
                        className="text-gray-600 text-sm hover:text-purple-600 transition-colors"
                    >
                        Sign out and return to login
                    </button>
                </div>
            </div>
        </div>
    );
}
