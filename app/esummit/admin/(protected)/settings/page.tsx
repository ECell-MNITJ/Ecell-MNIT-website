'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiSave, FiLock, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [scannerPassword, setScannerPassword] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactAddress, setContactAddress] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('esummit_settings')
                .select('scanner_password, contact_email, contact_phone, contact_address')
                .single();

            if (error) throw error;
            if (data) {
                const settings = data as any;
                setScannerPassword(settings.scanner_password || '');
                setContactEmail(settings.contact_email || '');
                setContactPhone(settings.contact_phone || '');
                setContactAddress(settings.contact_address || '');
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            // Don't show toast on load error to avoid annoyance if table is empty
        }
    };

    const handleUpdateSettings = async (e: React.FormEvent) => {
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
                        contact_email: contactEmail,
                        contact_phone: contactPhone,
                        contact_address: contactAddress,
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
                        .update({
                            scanner_password: scannerPassword,
                            contact_email: contactEmail,
                            contact_phone: contactPhone,
                            contact_address: contactAddress,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', settings.id);
                    error = updateError;
                }
            }

            if (error) throw error;
            toast.success('Settings updated successfully');
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

                <form onSubmit={handleUpdateSettings} className="space-y-4">
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

                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-md font-bold mb-4">Contact Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                                <input
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent outline-none transition-all"
                                    placeholder="esummit@mnit.ac.in"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                                <input
                                    type="text"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent outline-none transition-all"
                                    placeholder="+91 98765 43210"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
                                <textarea
                                    value={contactAddress}
                                    onChange={(e) => setContactAddress(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent outline-none transition-all min-h-[100px]"
                                    placeholder="Enter physical address"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-primary-golden text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (
                                <>
                                    <FiSave /> Save Settings
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
