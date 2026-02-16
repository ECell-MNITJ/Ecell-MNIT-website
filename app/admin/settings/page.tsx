'use client';

import { useState, useEffect } from 'react';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { updateSiteSettings, SiteSettingsUpdate } from '@/lib/site-settings';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
    const { settings, refreshSettings } = useSiteSettings();
    const [formData, setFormData] = useState<SiteSettingsUpdate>({});
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const supabase = createClient();

    // ... (useEffect remains same)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');
        setMessage('');

        const result = await updateSiteSettings(supabase, formData);

        if (result.success) {
            setStatus('success');
            setMessage('Settings updated successfully!');
            refreshSettings();
        } else {
            setStatus('error');
            setMessage('Failed to update settings. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-8">Site Settings</h1>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Contact Information */}
                    <div>
                        <h2 className="text-xl font-semibold text-primary-golden mb-4">Contact Information</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Contact Email
                                </label>
                                <input
                                    type="email"
                                    name="contact_email"
                                    value={formData.contact_email || ''}
                                    onChange={handleChange}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-golden"
                                    placeholder="ecell@mnit.ac.in"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Contact Phone
                                </label>
                                <input
                                    type="text"
                                    name="contact_phone"
                                    value={formData.contact_phone || ''}
                                    onChange={handleChange}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-golden"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-golden resize-none"
                                    placeholder="Full address..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="border-t border-gray-700 pt-6">
                        <h2 className="text-xl font-semibold text-primary-golden mb-4">Social Media Links</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    <i className="fab fa-facebook text-blue-500 mr-2"></i> Facebook URL
                                </label>
                                <input
                                    type="url"
                                    name="facebook_url"
                                    value={formData.facebook_url || ''}
                                    onChange={handleChange}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-golden"
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    <i className="fab fa-twitter text-blue-400 mr-2"></i> Twitter (X) URL
                                </label>
                                <input
                                    type="url"
                                    name="twitter_url"
                                    value={formData.twitter_url || ''}
                                    onChange={handleChange}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-golden"
                                    placeholder="https://twitter.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    <i className="fab fa-instagram text-pink-500 mr-2"></i> Instagram URL
                                </label>
                                <input
                                    type="url"
                                    name="instagram_url"
                                    value={formData.instagram_url || ''}
                                    onChange={handleChange}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-golden"
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    <i className="fab fa-linkedin text-blue-700 mr-2"></i> LinkedIn URL
                                </label>
                                <input
                                    type="url"
                                    name="linkedin_url"
                                    value={formData.linkedin_url || ''}
                                    onChange={handleChange}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-golden"
                                    placeholder="https://linkedin.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    <i className="fab fa-youtube text-red-600 mr-2"></i> YouTube URL
                                </label>
                                <input
                                    type="url"
                                    name="youtube_url"
                                    value={formData.youtube_url || ''}
                                    onChange={handleChange}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-golden"
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status Message */}
                    {status !== 'idle' && (
                        <div className={`p-4 rounded-lg ${status === 'success' ? 'bg-green-900/50 text-green-300 border border-green-500/50' : 'bg-red-900/50 text-red-300 border border-red-500/50'}`}>
                            {message}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary-golden text-black font-bold py-3 px-8 rounded-full hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
