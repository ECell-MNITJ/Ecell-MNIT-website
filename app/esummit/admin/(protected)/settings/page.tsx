'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiSave, FiLock, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [scannerPassword, setScannerPassword] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('esummit_settings')
                .select('scanner_password')
                .single();

            if (error) throw error;
            if (data) {
                setScannerPassword(data.scanner_password || '');
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            // Don't show toast on load error to avoid annoyance if table is empty
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Check if settings row exists
            const { count } = await supabase.from('esummit_settings').select('*', { count: 'exact', head: true });

            let error;
            if (count === 0) {
                // Insert default row with new password
                const { error: insertError } = await supabase
                    .from('esummit_settings')
                    .insert({
                        scanner_password: scannerPassword,
                        show_stats: true,
                        show_blueprint: true
                    });
                error = insertError;
            } else {
                // Update existing row (assuming single row design for settings)
                // We update all rows basically, or just the first one. 
                // Since user didn't specify ID, we'll try to update where id=1 or similar, 
                // OR better, since it's a singleton pattern, we might need to know the ID.
                // However, without ID, we can't easily update. 
                // Let's assume there's only one row and fetch it first to get ID.

                const { data: settings } = await supabase.from('esummit_settings').select('id').limit(1).single();

                if (settings) {
                    const { error: updateError } = await supabase
                        .from('esummit_settings')
                        .update({ scanner_password: scannerPassword, updated_at: new Date().toISOString() })
                        .eq('id', settings.id);
                    error = updateError;
                }
            }

            if (error) throw error;
            toast.success('Scanner password updated successfully');
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error(error.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">E-Summit Settings</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-xl">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FiLock className="text-primary-golden" />
                    Scanner Security
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                    Set the password required to access the QR Code Scanner page (`/esummit/scan`).
                    Share this only with authorized volunteers.
                </p>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scanner Access Password</label>
                        <input
                            type="text"
                            value={scannerPassword}
                            onChange={(e) => setScannerPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent outline-none transition-all"
                            placeholder="Enter new password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-primary-golden text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <FiSave /> Save Password
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
