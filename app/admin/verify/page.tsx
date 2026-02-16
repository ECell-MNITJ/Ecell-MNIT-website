'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { FiLock } from 'react-icons/fi';

export default function AdminVerify() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Check password against environment variable
            const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PANEL_PASSWORD;

            if (!adminPassword) {
                throw new Error('Admin panel password not configured');
            }

            if (password === adminPassword) {
                // Set verification cookie
                document.cookie = 'admin-verified=true; path=/; max-age=86400; SameSite=Strict';
                toast.success('Access granted!');
                router.push('/admin/dashboard');
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
        router.push('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-green via-gray-900 to-primary-green flex items-center justify-center p-4">
            <Toaster position="top-right" />

            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-golden/10 rounded-full mb-4">
                        <FiLock className="w-8 h-8 text-primary-golden" />
                    </div>
                    <h1 className="text-3xl font-heading text-primary-green mb-2">
                        Admin Panel Access
                    </h1>
                    <p className="text-gray-600">Enter the admin panel password to continue</p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-2">
                            Admin Panel Password
                        </label>
                        <input
                            id="admin-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoFocus
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary-golden to-yellow-700 text-white font-semibold py-3 rounded-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying...' : 'Verify Access'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={handleLogout}
                        className="text-gray-600 text-sm hover:text-primary-golden transition-colors"
                    >
                        Sign out and return to login
                    </button>
                </div>
            </div>
        </div>
    );
}
