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

    // CA Settings
    const [caBaseDiscount, setCaBaseDiscount] = useState(0);
    const [caMilestone1Count, setCaMilestone1Count] = useState(0);
    const [caMilestone1Discount, setCaMilestone1Discount] = useState(0);
    const [caMilestone2Count, setCaMilestone2Count] = useState(0);
    const [caMilestone2Discount, setCaMilestone2Discount] = useState(0);
    const [caRegistrationsOpen, setCaRegistrationsOpen] = useState(true);

    // Pass Features Inventory
    const [passFeaturesList, setPassFeaturesList] = useState<string[]>([]);
    const [newFeature, setNewFeature] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('esummit_settings')
                .select('*')
                .single();

            if (error) throw error;
            if (data) {
                const settings = data as any;
                setScannerPassword(settings.scanner_password || '');
                setContactEmail(settings.contact_email || '');
                setContactPhone(settings.contact_phone || '');
                setContactAddress(settings.contact_address || '');
                setCaBaseDiscount(settings.ca_base_discount_percentage || 0);
                setCaMilestone1Count(settings.ca_milestone_1_count || 0);
                setCaMilestone1Discount(settings.ca_milestone_1_discount || 0);
                setCaMilestone2Count(settings.ca_milestone_2_count || 0);
                setCaMilestone2Discount(settings.ca_milestone_2_discount || 0);
                setCaRegistrationsOpen(settings.ca_registrations_open !== undefined ? settings.ca_registrations_open : true);
                setPassFeaturesList(settings.pass_features_list || []);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const handleUpdateSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { count } = await supabase.from('esummit_settings').select('*', { count: 'exact', head: true });

            let error;
            if (count === 0) {
                const { error: insertError } = await supabase
                    .from('esummit_settings')
                    .insert({
                        scanner_password: scannerPassword,
                        contact_email: contactEmail,
                        contact_phone: contactPhone,
                        contact_address: contactAddress,
                        ca_base_discount_percentage: caBaseDiscount,
                        ca_milestone_1_count: caMilestone1Count,
                        ca_milestone_1_discount: caMilestone1Discount,
                        ca_milestone_2_count: caMilestone2Count,
                        ca_milestone_2_discount: caMilestone2Discount,
                        ca_registrations_open: caRegistrationsOpen,
                        pass_features_list: passFeaturesList,
                        show_stats: true,
                        show_blueprint: true
                    });
                error = insertError;
            } else {
                const { data: settings } = await supabase.from('esummit_settings').select('id').limit(1).single();

                if (settings) {
                    const { error: updateError } = await supabase
                        .from('esummit_settings')
                        .update({
                            scanner_password: scannerPassword,
                            contact_email: contactEmail,
                            contact_phone: contactPhone,
                            contact_address: contactAddress,
                            ca_base_discount_percentage: caBaseDiscount,
                            ca_milestone_1_count: caMilestone1Count,
                            ca_milestone_1_discount: caMilestone1Discount,
                            ca_milestone_2_count: caMilestone2Count,
                            ca_milestone_2_discount: caMilestone2Discount,
                            ca_registrations_open: caRegistrationsOpen,
                            pass_features_list: passFeaturesList,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', settings.id);
                    error = updateError;
                }
            }

            if (error) throw error;
            toast.success('Settings updated successfully');
        } catch (error: any) {
            console.error('Update error full details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            toast.error(error.message || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const addFeature = () => {
        if (!newFeature.trim()) return;
        if (passFeaturesList.includes(newFeature.trim())) {
            toast.error('Feature already exists');
            return;
        }
        setPassFeaturesList([...passFeaturesList, newFeature.trim()]);
        setNewFeature('');
    };

    const removeFeature = (index: number) => {
        setPassFeaturesList(passFeaturesList.filter((_, i) => i !== index));
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">E-Summit Settings</h1>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <FiLock className="text-primary-golden" />
                        Common Settings
                    </h2>

                    <form onSubmit={handleUpdateSettings} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Scanner Access Password</label>
                            <input
                                type="text"
                                value={scannerPassword}
                                onChange={(e) => setScannerPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent outline-none transition-all"
                                placeholder="Enter password"
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
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
                                    <textarea
                                        value={contactAddress}
                                        onChange={(e) => setContactAddress(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent outline-none transition-all min-h-[80px]"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-md font-bold mb-4">Campus Ambassador Program</h3>
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100 mb-4">
                                <div>
                                    <h4 className="font-bold text-xs text-purple-900 uppercase tracking-wider">CA STatus</h4>
                                    <p className="text-[10px] text-purple-700">Toggle CA Applications</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={caRegistrationsOpen}
                                        onChange={(e) => setCaRegistrationsOpen(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none ring-0 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Buyer Discount (%)</label>
                                    <input
                                        type="number"
                                        value={caBaseDiscount}
                                        onChange={(e) => setCaBaseDiscount(Number(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-golden outline-none"
                                    />
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">MS 1 (Count/Disc)</label>
                                    <div className="flex gap-2">
                                        <input type="number" value={caMilestone1Count} onChange={(e) => setCaMilestone1Count(Number(e.target.value))} className="w-full p-1 border rounded text-xs" />
                                        <input type="number" value={caMilestone1Discount} onChange={(e) => setCaMilestone1Discount(Number(e.target.value))} className="w-full p-1 border rounded text-xs" />
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">MS 2 (Count/Disc)</label>
                                    <div className="flex gap-2">
                                        <input type="number" value={caMilestone2Count} onChange={(e) => setCaMilestone2Count(Number(e.target.value))} className="w-full p-1 border rounded text-xs" />
                                        <input type="number" value={caMilestone2Discount} onChange={(e) => setCaMilestone2Discount(Number(e.target.value))} className="w-full p-1 border rounded text-xs" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-golden text-white font-bold rounded-xl hover:bg-yellow-600 transition-colors shadow-lg shadow-yellow-500/20 disabled:opacity-50"
                            >
                                <FiSave /> {loading ? 'Saving...' : 'Save All Settings'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <FiCheck className="text-green-600" />
                        Pass Features Inventory
                    </h2>
                    <p className="text-gray-500 text-sm mb-6 uppercase tracking-widest font-bold">
                        Manage all possible features that can be added to passes.
                    </p>

                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                                placeholder="Add new feature (e.g. Lunch Coupon)"
                                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 outline-none"
                            />
                            <button
                                onClick={addFeature}
                                className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Add
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                            <div className="max-h-[500px] overflow-y-auto">
                                {passFeaturesList.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 italic">No features added yet.</div>
                                ) : (
                                    passFeaturesList.map((feat, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-white transition-colors">
                                            <span className="text-sm font-medium text-gray-700">{feat}</span>
                                            <button
                                                onClick={() => removeFeature(index)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                title="Remove Feature"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 italic">Note: Removing a feature here will only remove it from the inventory. It won't automatically remove it from passes where it was already assigned, but it will disappear from future selection.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

