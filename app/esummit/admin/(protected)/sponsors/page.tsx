'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiImage, FiPlus, FiTrash2, FiEdit2, FiSave, FiX, FiCheck, FiLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ESummitSponsor {
    id: string;
    name: string;
    logo_url: string | null;
    website_url: string | null;
    brand_contributor: string | null;
    display_order: number;
}

export default function SponsorsAdminPage() {
    const [sponsors, setSponsors] = useState<ESummitSponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Settings State
    const [settings, setSettings] = useState<{
        show_sponsors: boolean;
        sponsors_heading: string;
    }>({
        show_sponsors: true,
        sponsors_heading: 'Our Sponsors'
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    // Form State
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newWebsite, setNewWebsite] = useState('');
    const [newBrandContributor, setNewBrandContributor] = useState('');
    const [newImage, setNewImage] = useState<File | null>(null);

    // Editing State
    const [editingSponsor, setEditingSponsor] = useState<ESummitSponsor | null>(null);
    const [editImage, setEditImage] = useState<File | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchSponsors(), fetchSettings()]);
        setLoading(false);
    };

    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from('esummit_settings')
            .select('show_sponsors, sponsors_heading')
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching settings:', error);
        } else if (data) {
            const typedData = data as any;
            setSettings({
                show_sponsors: typedData.show_sponsors !== undefined ? typedData.show_sponsors : true,
                sponsors_heading: typedData.sponsors_heading || 'Our Sponsors'
            });
        }
    };

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        const { error } = await supabase
            .from('esummit_settings')
            .update({
                show_sponsors: settings.show_sponsors,
                sponsors_heading: settings.sponsors_heading,
                updated_at: new Date().toISOString()
            })
            .eq('id', 1); // Assuming singleton settings row with ID 1

        if (error) {
            console.error('Error updating settings:', error);
            toast.error('Failed to update settings');
        } else {
            toast.success('Settings updated');
        }
        setIsSavingSettings(false);
    };

    const fetchSponsors = async () => {
        const { data, error } = await supabase
            .from('esummit_sponsors')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching sponsors:', error);
            toast.error('Failed to load sponsors');
        } else {
            setSponsors((data as any as ESummitSponsor[]) || []);
        }
    };

    const uploadImage = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('esummit_uploads')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('esummit_uploads')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleAddSponsor = async () => {
        if (!newName.trim()) {
            toast.error("Sponsor name is required.");
            return;
        }

        try {
            let imageUrl = null;
            if (newImage) {
                imageUrl = await uploadImage(newImage);
            }

            const { data, error } = await supabase
                .from('esummit_sponsors')
                .insert({
                    name: newName,
                    website_url: newWebsite,
                    brand_contributor: newBrandContributor,
                    logo_url: imageUrl,
                    display_order: sponsors.length
                })
                .select()
                .single();

            if (error) throw error;

            setSponsors([...sponsors, data as any as ESummitSponsor]);
            setNewName('');
            setNewWebsite('');
            setNewBrandContributor('');
            setNewImage(null);
            setIsAdding(false);
            toast.success('Sponsor added successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to add sponsor');
        }
    };

    const handleDeleteSponsor = async (id: string) => {
        if (!confirm('Are you sure you want to delete this sponsor?')) return;
        try {
            const { error } = await supabase.from('esummit_sponsors').delete().eq('id', id);
            if (error) throw error;
            setSponsors(sponsors.filter(s => s.id !== id));
            toast.success('Sponsor deleted');
        } catch (error) {
            toast.error('Failed to delete sponsor');
        }
    };

    const handleUpdateSponsor = async () => {
        if (!editingSponsor) return;

        try {
            let imageUrl = editingSponsor.logo_url;
            if (editImage) {
                imageUrl = await uploadImage(editImage);
            }

            const { error } = await supabase
                .from('esummit_sponsors')
                .update({
                    name: editingSponsor.name,
                    website_url: editingSponsor.website_url,
                    brand_contributor: editingSponsor.brand_contributor,
                    logo_url: imageUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingSponsor.id);

            if (error) throw error;

            setSponsors(sponsors.map(s => s.id === editingSponsor.id ? { ...editingSponsor, logo_url: imageUrl } : s));
            setEditingSponsor(null);
            setEditImage(null);
            toast.success('Sponsor updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update sponsor');
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

    return (
        <div className="space-y-12 pb-20 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-heading text-purple-400">Sponsors Management</h1>
                <p className="text-gray-400">Manage the sponsors marquee displayed on the E-Summit home page.</p>
            </div>

            {/* Visibility Settings Section */}
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FiImage className="text-esummit-primary" /> Marquee Settings
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
                            value={settings.sponsors_heading}
                            onChange={(e) => setSettings({ ...settings, sponsors_heading: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                            placeholder="Our Sponsors"
                        />
                    </div>
                    <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <div>
                            <span className="block font-bold text-white">Show Sponsors Marquee</span>
                            <span className="text-xs text-gray-400">Toggle visibility on the home page</span>
                        </div>
                        <button
                            onClick={() => setSettings(prev => ({ ...prev, show_sponsors: !prev.show_sponsors }))}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.show_sponsors ? 'bg-purple-600' : 'bg-gray-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.show_sponsors ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Sponsors List Section */}
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        Sponsors List
                    </h2>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        {isAdding ? 'Cancel' : <><FiPlus /> Add Sponsor</>}
                    </button>
                </div>

                {isAdding && (
                    <div className="mb-8 bg-gray-800 p-6 rounded-xl border border-gray-700 animate-fade-in-down">
                        <h3 className="font-bold text-white mb-4">New Sponsor</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase text-gray-400 mb-1">Name *</label>
                                <input
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none"
                                    placeholder="Sponsor Name"
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
                                <label className="block text-xs uppercase text-gray-400 mb-1">Brand Contributor (e.g. Official Ecosystem Partner)</label>
                                <input
                                    value={newBrandContributor}
                                    onChange={e => setNewBrandContributor(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none"
                                    placeholder="Official Ecosystem Partner"
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
                                onClick={handleAddSponsor}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded font-bold"
                            >
                                Save Sponsor
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {sponsors.length === 0 && !isAdding && (
                        <div className="text-center py-8 text-gray-500">
                            No sponsors added yet. Click 'Add Sponsor' to get started.
                        </div>
                    )}

                    {sponsors.map((sponsor) => {
                        const isEditing = editingSponsor?.id === sponsor.id;

                        if (isEditing) {
                            return (
                                <div key={sponsor.id} className="bg-gray-800 p-6 rounded-xl border border-purple-500/50 flex flex-col gap-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs uppercase text-gray-400 mb-1">Name</label>
                                            <input
                                                value={editingSponsor!.name}
                                                onChange={e => setEditingSponsor({ ...editingSponsor!, name: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                                                placeholder="Name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase text-gray-400 mb-1">Website URL</label>
                                            <input
                                                value={editingSponsor!.website_url || ''}
                                                onChange={e => setEditingSponsor({ ...editingSponsor!, website_url: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-xs uppercase text-gray-400 mb-1">Brand Contributor</label>
                                            <input
                                                value={editingSponsor!.brand_contributor || ''}
                                                onChange={e => setEditingSponsor({ ...editingSponsor!, brand_contributor: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                                                placeholder="Official Ecosystem Partner"
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
                                            {sponsor.logo_url && !editImage && (
                                                <div className="mt-2 text-xs text-gray-400">Current logo: <a href={sponsor.logo_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">View</a></div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-2">
                                        <button onClick={() => { setEditingSponsor(null); setEditImage(null); }} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                        <button onClick={handleUpdateSponsor} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Save Changes</button>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={sponsor.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col md:flex-row items-center gap-6 relative group">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingSponsor(sponsor)} className="p-2 bg-gray-700 rounded text-gray-300 hover:text-purple-400"><FiEdit2 size={14} /></button>
                                    <button onClick={() => handleDeleteSponsor(sponsor.id)} className="p-2 bg-gray-700 rounded text-gray-300 hover:text-red-500"><FiTrash2 size={14} /></button>
                                </div>

                                <div className="shrink-0 w-32 h-20 bg-gray-900 rounded border border-gray-700 flex items-center justify-center p-2 overflow-hidden">
                                    {sponsor.logo_url ? (
                                        <img src={sponsor.logo_url} alt={sponsor.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-xs text-gray-500 font-bold">{sponsor.name}</span>
                                    )}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-xl font-bold text-white">{sponsor.name}</h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                        {sponsor.brand_contributor && (
                                            <span className="text-sm text-purple-400 font-medium">
                                                {sponsor.brand_contributor}
                                            </span>
                                        )}
                                        {sponsor.website_url && (
                                            <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-purple-400 hover:underline">
                                                <FiLink size={12} /> {sponsor.website_url.replace(/^https?:\/\//, '')}
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
