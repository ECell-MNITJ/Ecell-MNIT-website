'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ResetPassword() {
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
            if (otpCode && email) {
                const { error: verifyError } = await supabase.auth.verifyOtp({
                    email,
                    token: otpCode,
                    type: 'recovery',
                });
                if (verifyError) throw verifyError;
            }

            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            toast.success('Password updated successfully!');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-12 flex items-center justify-center p-4 bg-black font-body">
            <div className="max-w-md w-full bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-heading text-primary-golden mb-2">
                        {otpCode || (email && showOtp) ? 'Verify & Reset' : 'New Password'}
                    </h1>
                    <p className="text-gray-400">
                        {email ? `Updating for ${email}` : 'Set your secure new password'}
                    </p>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    {email && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                6-Digit Verification Code
                            </label>
                            <input
                                type="text"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary-golden focus:border-transparent transition-all placeholder-gray-500 tracking-[0.2em] font-mono text-center"
                                placeholder="00000000"
                                maxLength={8}
                            />
                            <p className="text-[10px] text-gray-500 mt-2">
                                Only needed if you didn&apos;t click the link on this device.
                            </p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                            New Password
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

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>

                {!email && !loading && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-xs text-red-400 text-center">
                            No active reset session found. Please click the link in your email or start over.
                        </p>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm">
                    <p className="text-gray-400">
                        Back to{' '}
                        <Link href="/login" className="text-primary-golden font-semibold hover:text-white transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
