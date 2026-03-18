'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiImage, FiPlus, FiTrash2, FiEdit2, FiSave, FiX, FiCheck, FiLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ESummitInvestor {
    id: string;
    name: string | null;
    logo_url: string | null;
    website_url: string | null;
    display_order: number;
}

export default function InvestorsAdminPage() {
    const [investors, setInvestors] = useState<ESummitInvestor[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Settings State
    const [settings, setSettings] = useState<{
        show_investors: boolean;
        investors_heading: string;
    }>({
        show_investors: true,
        investors_heading: "Investors of F'10"
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    // Form State
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newWebsite, setNewWebsite] = useState('');
    const [newImage, setNewImage] = useState<File | null>(null);

    // Editing State
    const [editingInvestor, setEditingInvestor] = useState<ESummitInvestor | null>(null);
    const [editImage, setEditImage] = useState<File | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchInvestors(), fetchSettings()]);
        setLoading(false);
    };

    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from('esummit_settings')
            .select('show_investors, investors_heading')
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching settings:', error);
        } else if (data) {
            const typedData = data as any;
            setSettings({
                show_investors: typedData.show_investors !== undefined ? typedData.show_investors : true,
                investors_heading: typedData.investors_heading || "Investors of F'10"
            });
        }
    };

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        const { error } = await supabase
            .from('esummit_settings')
            .update({
                show_investors: settings.show_investors,
                investors_heading: settings.investors_heading,
                updated_at: new Date().toISOString()
            })
            .eq('id', 1);

        if (error) {
            console.error('Error updating settings:', error);
            toast.error('Failed to update settings');
        } else {
            toast.success('Settings updated');
        }
        setIsSavingSettings(false);
    };

    const fetchInvestors = async () => {
        const { data, error } = await supabase
            .from('esummit_investors')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching investors:', error);
            toast.error('Failed to load investors');
        } else {
            setInvestors((data as any as ESummitInvestor[]) || []);
        }
    };

    const uploadImage = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('esummit_uploads')
            .upload(filePath, file, {
                cacheControl: '604800'
            });

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('esummit_uploads')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleAddInvestor = async () => {
        if (!newImage) {
            toast.error('Please select a logo');
            return;
        }
        try {
            const imageUrl = await uploadImage(newImage);

            const { data, error } = await supabase
                .from('esummit_investors')
                .insert({
                    name: newName || null,
                    website_url: newWebsite,
                    logo_url: imageUrl,
                    display_order: investors.length
                })
                .select()
                .single();

            if (error) throw error;

            setInvestors([...investors, data as any as ESummitInvestor]);
            setNewName('');
            setNewWebsite('');
            setNewImage(null);
            setIsAdding(false);
            toast.success('Investor added successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to add investor');
        }
    };

    const handleDeleteInvestor = async (id: string) => {
        if (!confirm('Are you sure you want to delete this investor?')) return;
        try {
            const { error } = await supabase.from('esummit_investors').delete().eq('id', id);
            if (error) throw error;
            setInvestors(investors.filter(s => s.id !== id));
            toast.success('Investor deleted');
        } catch (error) {
            toast.error('Failed to delete investor');
        }
    };

    const handleUpdateInvestor = async () => {
        if (!editingInvestor) return;

        try {
            let imageUrl = editingInvestor.logo_url;
            if (editImage) {
                imageUrl = await uploadImage(editImage);
            }

            const { error } = await supabase
                .from('esummit_investors')
                .update({
                    name: editingInvestor.name || null,
                    website_url: editingInvestor.website_url,
                    logo_url: imageUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingInvestor.id);

            if (error) throw error;

            setInvestors(investors.map(s => s.id === editingInvestor.id ? { ...editingInvestor, logo_url: imageUrl } : s));
            setEditingInvestor(null);
            setEditImage(null);
            toast.success('Investor updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update investor');
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

    return (
        <div className="space-y-12 pb-20 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-heading text-purple-400">Investors Management</h1>
                <p className="text-gray-400">Manage the investors displayed on the E-Summit home page.</p>
            </div>

            {/* Visibility Settings Section */}
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FiImage className="text-esummit-primary" /> Section Settings
                    </h2>
                    <button
                        onClick={handleSaveSettings}
                        disabled={isSavingSettings}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {isSavingSettings ? 'Saving...' : <><FiSave /> Save</>}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs uppercase text-gray-400 mb-1">Section Heading</label>
                        <input
                            value={settings.investors_heading}
                            onChange={(e) => setSettings({ ...settings, investors_heading: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                            placeholder="Investors of F'10"
                        />
                    </div>
                    <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <div>
                            <span className="block font-bold text-white">Show Investors Section</span>
                            <span className="text-xs text-gray-400">Toggle visibility on the home page</span>
                        </div>
                        <button
                            onClick={() => setSettings(prev => ({ ...prev, show_investors: !prev.show_investors }))}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.show_investors ? 'bg-purple-600' : 'bg-gray-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.show_investors ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Investors List Section */}
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        Investors List
                    </h2>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        {isAdding ? 'Cancel' : <><FiPlus /> Add Investor</>}
                    </button>
                </div>

                {isAdding && (
                    <div className="mb-8 bg-gray-800 p-6 rounded-xl border border-gray-700 animate-fade-in-down">
                        <h3 className="font-bold text-white mb-4">New Investor</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase text-gray-400 mb-1">Name (Optional)</label>
                                <input
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none"
                                    placeholder="Investor Name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-400 mb-1">Website URL</label>
                                <input
                                    value={newWebsite}
                                    onChange={e => setNewWebsite(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs uppercase text-gray-400 mb-1">Logo Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-white"
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleAddInvestor}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded font-bold"
                            >
                                Save Investor
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {investors.length === 0 && !isAdding && (
                        <div className="text-center py-8 text-gray-500">
                            No investors added yet. Click 'Add Investor' to get started.
                        </div>
                    )}

                    {investors.map((investor) => {
                        const isEditing = editingInvestor?.id === investor.id;

                        if (isEditing) {
                            return (
                                <div key={investor.id} className="bg-gray-800 p-6 rounded-xl border border-purple-500/50 flex flex-col gap-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs uppercase text-gray-400 mb-1">Name</label>
                                            <input
                                                value={editingInvestor!.name || ''}
                                                onChange={e => setEditingInvestor({ ...editingInvestor!, name: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                                                placeholder="Name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase text-gray-400 mb-1">Website URL</label>
                                            <input
                                                value={editingInvestor!.website_url || ''}
                                                onChange={e => setEditingInvestor({ ...editingInvestor!, website_url: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-xs uppercase text-gray-400 mb-1">New Logo Image (Optional)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-white"
                                            />
                                            {investor.logo_url && !editImage && (
                                                <div className="mt-2 text-xs text-gray-400">Current logo: <a href={investor.logo_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">View</a></div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-2">
                                        <button onClick={() => { setEditingInvestor(null); setEditImage(null); }} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                        <button onClick={handleUpdateInvestor} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Save Changes</button>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={investor.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col md:flex-row items-center gap-6 relative group">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingInvestor(investor)} className="p-2 bg-gray-700 rounded text-gray-300 hover:text-purple-400"><FiEdit2 size={14} /></button>
                                    <button onClick={() => handleDeleteInvestor(investor.id)} className="p-2 bg-gray-700 rounded text-gray-300 hover:text-red-500"><FiTrash2 size={14} /></button>
                                </div>

                                <div className="shrink-0 w-32 h-20 bg-gray-900 rounded border border-gray-700 flex items-center justify-center p-2 overflow-hidden">
                                    {investor.logo_url ? (
                                        <img src={investor.logo_url} alt={investor.name || 'Investor'} className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-xs text-gray-500 font-bold">{investor.name}</span>
                                    )}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-xl font-bold text-white">{investor.name || 'Untitled Investor'}</h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                        {investor.website_url && (
                                            <a href={investor.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-purple-400 hover:underline">
                                                <FiLink size={12} /> {investor.website_url.replace(/^https?:\/\//, '')}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
