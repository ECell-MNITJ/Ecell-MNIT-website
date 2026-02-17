'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiLock, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ScannerLoginProps {
    onSuccess: () => void;
}

export default function ScannerLogin({ onSuccess }: ScannerLoginProps) {
    const supabase = createClient();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Check password using the secure DB function
            const { data, error: rpcError } = await supabase.rpc('verify_scanner_password', {
                input_password: password
            });

            if (rpcError) throw rpcError;

            // data is boolean from our function
            if (data === true) {
                toast.success('Access Granted');
                // Persist auth (simple localStorage for this specialized use-case)
                localStorage.setItem('esummit_scanner_auth', 'true');
                onSuccess();
            } else {
                setError('Incorrect password');
                toast.error('Access Denied');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-golden/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-700 shadow-inner">
                        <FiLock className="w-8 h-8 text-primary-golden" />
                    </div>

                    <h2 className="text-2xl font-bold text-white text-center mb-2">Scanner Login</h2>
                    <p className="text-gray-400 text-center text-sm mb-8">Enter the secure password to access the QR scanner tool.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-3 rounded-xl focus:border-primary-golden focus:ring-1 focus:ring-primary-golden outline-none transition-all placeholder:text-gray-600 pl-10"
                                    placeholder="Enter access password"
                                    required
                                />
                                <FiLock className="absolute left-3 top-3.5 text-gray-500" />
                            </div>
                            {error && (
                                <div className="mt-2 text-red-500 text-sm flex items-center gap-1 animate-pulse">
                                    <FiAlertTriangle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-golden text-black font-bold py-3 rounded-xl hover:bg-white transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20"
                        >
                            {loading ? 'Verifying...' : 'Unlock Scanner'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
