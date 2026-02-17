'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiTarget, FiActivity, FiCpu, FiGlobe, FiPlus, FiTrash2, FiEdit2, FiSave, FiX, FiCheck, FiLayers, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ESummitStat {
    id: string;
    label: string;
    value: string;
    display_order: number;
}

interface ESummitBlueprint {
    id: string;
    title: string;
    description: string;
    icon: string;
    align: 'left' | 'right';
    display_order: number;
    image_url?: string;
}

// Map of available icons
const ICON_MAP: Record<string, any> = {
    'FiTarget': FiTarget,
    'FiActivity': FiActivity,
    'FiCpu': FiCpu,
    'FiGlobe': FiGlobe,
    'FiLayers': FiLayers,
    'FiTrendingUp': FiTrendingUp
};

export default function LandingPageAdmin() {
    const [stats, setStats] = useState<ESummitStat[]>([]);
    const [blueprints, setBlueprints] = useState<ESummitBlueprint[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Stats Form State
    const [newStatLabel, setNewStatLabel] = useState('');
    const [newStatValue, setNewStatValue] = useState('');

    // Settings State
    const [settings, setSettings] = useState<{
        show_stats: boolean;
        show_blueprint: boolean;
        instagram_url: string;
        linkedin_url: string;
        twitter_url: string;
        facebook_url: string;
        youtube_url: string;
    }>({
        show_stats: true,
        show_blueprint: true,
        instagram_url: '',
        linkedin_url: '',
        twitter_url: '',
        facebook_url: '',
        youtube_url: ''
    });

    // Blueprint Form State
    const [newBpTitle, setNewBpTitle] = useState('');
    const [newBpDesc, setNewBpDesc] = useState('');
    const [newBpIcon, setNewBpIcon] = useState('FiTarget');
    const [newBpAlign, setNewBpAlign] = useState<'left' | 'right'>('left');
    const [newBpImage, setNewBpImage] = useState<File | null>(null);
    const [isAddingBp, setIsAddingBp] = useState(false);

    // Editing State
    const [editingStat, setEditingStat] = useState<ESummitStat | null>(null);
    const [editingBlueprint, setEditingBlueprint] = useState<ESummitBlueprint | null>(null);
    const [editBpImage, setEditBpImage] = useState<File | null>(null);



    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchStats(), fetchBlueprints(), fetchSettings()]);
        setLoading(false);
    };

    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from('esummit_settings')
            .select('*')
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching settings:', error);
        } else if (data) {
            const typedData = data as any;
            setSettings({
                show_stats: typedData.show_stats,
                show_blueprint: typedData.show_blueprint,
                instagram_url: typedData.instagram_url || '',
                linkedin_url: typedData.linkedin_url || '',
                twitter_url: typedData.twitter_url || '',
                facebook_url: typedData.facebook_url || '',
                youtube_url: typedData.youtube_url || ''
            });
        }
    };

    const toggleSetting = async (key: 'show_stats' | 'show_blueprint') => {
        const newValue = !settings[key];
        setSettings(prev => ({ ...prev, [key]: newValue }));

        const { error } = await supabase
            .from('esummit_settings')
            .update({ [key]: newValue, updated_at: new Date().toISOString() })
            .eq('id', 1);

        if (error) {
            console.error('Error updating settings:', error);
            toast.error('Failed to update setting');
            // Revert on error
            setSettings(prev => ({ ...prev, [key]: !newValue }));
        } else {
            toast.success('Settings updated');
        }
    };

    const handleUpdateSocials = async () => {
        const { error } = await supabase
            .from('esummit_settings')
            .update({
                instagram_url: settings.instagram_url,
                linkedin_url: settings.linkedin_url,
                twitter_url: settings.twitter_url,
                facebook_url: settings.facebook_url,
                youtube_url: settings.youtube_url,
                updated_at: new Date().toISOString()
            })
            .eq('id', 1);

        if (error) {
            console.error('Error updating socials:', error);
            toast.error('Failed to update socials');
        } else {
            toast.success('Social media links updated');
        }
    };

    const fetchStats = async () => {
        const { data, error } = await supabase
            .from('esummit_stats')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to load stats');
        } else {
            setStats(data || []);
        }
    };

    const fetchBlueprints = async () => {
        const { data, error } = await supabase
            .from('esummit_blueprint')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching blueprints:', error);
            toast.error('Failed to load blueprint');
        } else {
            setBlueprints(data || []);
        }
    };

    // --- Stats Actions ---

    const handleAddStat = async () => {
        if (!newStatLabel.trim() || !newStatValue.trim()) return;

        try {
            const { data, error } = await supabase
                .from('esummit_stats')
                .insert({
                    label: newStatLabel,
                    value: newStatValue,
                    display_order: stats.length
                })
                .select()
                .single();

            if (error) throw error;

            setStats([...stats, data]);
            setNewStatLabel('');
            setNewStatValue('');
            toast.success('Stat added');
        } catch (error) {
            toast.error('Failed to add stat');
        }
    };

    const handleDeleteStat = async (id: string) => {
        if (!confirm('Area you sure?')) return;
        try {
            const { error } = await supabase.from('esummit_stats').delete().eq('id', id);
            if (error) throw error;
            setStats(stats.filter(s => s.id !== id));
            toast.success('Stat deleted');
        } catch (error) {
            toast.error('Failed to delete stat');
        }
    };

    const handleUpdateStat = async () => {
        if (!editingStat) return;
        try {
            const { error } = await supabase
                .from('esummit_stats')
                .update({
                    label: editingStat.label,
                    value: editingStat.value
                })
                .eq('id', editingStat.id);

            if (error) throw error;

            setStats(stats.map(s => s.id === editingStat.id ? editingStat : s));
            setEditingStat(null);
            toast.success('Stat updated');
        } catch (error) {
            toast.error('Failed to update stat');
        }
    };



    // --- Blueprint Actions ---

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

    const handleAddBlueprint = async () => {
        if (!newBpTitle.trim() || !newBpDesc.trim()) return;

        try {
            let imageUrl = '';
            if (newBpImage) {
                imageUrl = await uploadImage(newBpImage);
            }

            const { data, error } = await supabase
                .from('esummit_blueprint')
                .insert({
                    title: newBpTitle,
                    description: newBpDesc,
                    icon: newBpIcon,
                    align: newBpAlign,
                    image_url: imageUrl,
                    display_order: blueprints.length
                })
                .select()
                .single();

            if (error) throw error;

            setBlueprints([...blueprints, data]);
            setNewBpTitle('');
            setNewBpDesc('');
            setNewBpImage(null);
            setIsAddingBp(false);
            toast.success('Feature added');
        } catch (error) {
            console.error(error);
            toast.error('Failed to add feature');
        }
    };

    const handleDeleteBlueprint = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const { error } = await supabase.from('esummit_blueprint').delete().eq('id', id);
            if (error) throw error;
            setBlueprints(blueprints.filter(b => b.id !== id));
            toast.success('Feature deleted');
        } catch (error) {
            toast.error('Failed to delete feature');
        }
    };

    const handleUpdateBlueprint = async () => {
        if (!editingBlueprint) return;
        try {
            let imageUrl = editingBlueprint.image_url;
            if (editBpImage) {
                imageUrl = await uploadImage(editBpImage);
            }

            const { error } = await supabase
                .from('esummit_blueprint')
                .update({
                    title: editingBlueprint.title,
                    description: editingBlueprint.description,
                    icon: editingBlueprint.icon,
                    align: editingBlueprint.align,
                    image_url: imageUrl
                })
                .eq('id', editingBlueprint.id);

            if (error) throw error;

            setBlueprints(blueprints.map(b => b.id === editingBlueprint.id ? { ...editingBlueprint, image_url: imageUrl } : b));
            setEditingBlueprint(null);
            setEditBpImage(null);
            toast.success('Feature updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update feature');
        }
    };



    if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

    return (
        <div className="space-y-12 pb-20 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-heading text-purple-400">Landing Page Content</h1>
                <p className="text-gray-400">Manage the dynamic sections of the E-Summit home page.</p>
            </div>

            {/* --- Stats Section --- */}
            <section className={`bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg transition-opacity ${!settings.show_stats ? 'opacity-50' : ''}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FiActivity className="text-esummit-primary" /> By The Numbers
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">{settings.show_stats ? 'Visible' : 'Hidden'}</span>
                        <button
                            onClick={() => toggleSetting('show_stats')}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.show_stats ? 'bg-purple-600' : 'bg-gray-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.show_stats ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {stats.map((stat) => (
                        <div key={stat.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 relative group">
                            {editingStat?.id === stat.id ? (
                                <div className="space-y-2">
                                    <input
                                        value={editingStat.value}
                                        onChange={e => setEditingStat({ ...editingStat, value: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white font-black"
                                        autoFocus
                                    />
                                    <input
                                        value={editingStat.label}
                                        onChange={e => setEditingStat({ ...editingStat, label: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-gray-300 text-xs uppercase"
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button onClick={() => setEditingStat(null)} className="p-1 hover:bg-gray-700 rounded"><FiX size={14} /></button>
                                        <button onClick={handleUpdateStat} className="p-1 hover:bg-purple-900 text-purple-400 rounded"><FiCheck size={14} /></button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setEditingStat(stat)} className="text-gray-500 hover:text-purple-400"><FiEdit2 /></button>
                                        <button onClick={() => handleDeleteStat(stat.id)} className="text-gray-500 hover:text-red-500"><FiTrash2 /></button>
                                    </div>
                                    <div className="text-2xl font-black text-purple-400">{stat.value}</div>
                                    <div className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</div>
                                </>
                            )}
                        </div>
                    ))}

                    {/* Add Stat Form */}
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 border-dashed flex flex-col gap-2">
                        <input
                            value={newStatValue}
                            onChange={(e) => setNewStatValue(e.target.value)}
                            placeholder="Value (e.g. 10K+)"
                            className="bg-transparent text-white border-b border-gray-600 focus:border-purple-500 outline-none text-xl font-bold placeholder:font-normal placeholder:text-gray-600"
                        />
                        <input
                            value={newStatLabel}
                            onChange={(e) => setNewStatLabel(e.target.value)}
                            placeholder="Label (e.g. Footfall)"
                            className="bg-transparent text-gray-300 text-sm border-b border-gray-600 focus:border-purple-500 outline-none placeholder:text-gray-600"
                        />
                        <button
                            onClick={handleAddStat}
                            disabled={!newStatValue || !newStatLabel}
                            className="mt-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-1 px-3 rounded uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add Stat
                        </button>
                    </div>
                </div>
            </section>

            {/* --- Blueprint Section --- */}
            <section className={`bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg transition-opacity ${!settings.show_blueprint ? 'opacity-50' : ''}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FiTarget className="text-esummit-accent" /> The Blueprint
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400">{settings.show_blueprint ? 'Visible' : 'Hidden'}</span>
                            <button
                                onClick={() => toggleSetting('show_blueprint')}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.show_blueprint ? 'bg-purple-600' : 'bg-gray-700'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.show_blueprint ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <div className="h-6 w-px bg-gray-700 mx-2" />
                        <button
                            onClick={() => setIsAddingBp(!isAddingBp)}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            {isAddingBp ? 'Cancel' : <><FiPlus /> Add Feature</>}
                        </button>
                    </div>
                </div>

                {/* Add Feature Panel */}
                {isAddingBp && (
                    <div className="mb-8 bg-gray-800 p-6 rounded-xl border border-gray-700 animate-fade-in-down">
                        <h3 className="font-bold text-white mb-4">New Feature</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Title</label>
                                    <input
                                        value={newBpTitle}
                                        onChange={e => setNewBpTitle(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                                        placeholder="Feature Title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Description</label>
                                    <textarea
                                        value={newBpDesc}
                                        onChange={e => setNewBpDesc(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-purple-500 outline-none h-24 resize-none"
                                        placeholder="Feature Description"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Upload Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setNewBpImage(e.target.files?.[0] || null)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Icon</label>
                                    <div className="flex gap-4">
                                        {Object.keys(ICON_MAP).map(iconKey => {
                                            const Icon = ICON_MAP[iconKey];
                                            return (
                                                <button
                                                    key={iconKey}
                                                    onClick={() => setNewBpIcon(iconKey)}
                                                    className={`p-3 rounded-lg border ${newBpIcon === iconKey ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500'}`}
                                                >
                                                    <Icon className="text-xl" />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Alignment</label>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setNewBpAlign('left')}
                                            className={`flex-1 py-2 rounded border text-sm font-medium ${newBpAlign === 'left' ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-900 text-gray-400 border-gray-700'}`}
                                        >
                                            Left
                                        </button>
                                        <button
                                            onClick={() => setNewBpAlign('right')}
                                            className={`flex-1 py-2 rounded border text-sm font-medium ${newBpAlign === 'right' ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-900 text-gray-400 border-gray-700'}`}
                                        >
                                            Right
                                        </button>
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button
                                        onClick={handleAddBlueprint}
                                        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-bold"
                                    >
                                        Save Feature
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* List Features */}
                <div className="space-y-4">
                    {blueprints.map((item, index) => {
                        const Icon = ICON_MAP[item.icon] || FiTarget;
                        const isEditing = editingBlueprint?.id === item.id;

                        if (isEditing) {
                            return (
                                <div key={item.id} className="bg-gray-800 p-6 rounded-xl border border-purple-500/50 flex flex-col gap-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-xs uppercase text-gray-400 mb-1">Upload Image (Optional)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setEditBpImage(e.target.files?.[0] || null)}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                                            />
                                            {editingBlueprint!.image_url && (
                                                <div className="mt-2 text-xs text-gray-400">Current image: <a href={editingBlueprint!.image_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">View</a></div>
                                            )}
                                        </div>
                                        <input
                                            value={editingBlueprint!.title}
                                            onChange={e => setEditingBlueprint({ ...editingBlueprint!, title: e.target.value })}
                                            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white font-bold"
                                            placeholder="Title"
                                        />
                                        <div className="flex gap-2">
                                            <select
                                                value={editingBlueprint!.icon}
                                                onChange={e => setEditingBlueprint({ ...editingBlueprint!, icon: e.target.value })}
                                                className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                                            >
                                                {Object.keys(ICON_MAP).map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                            <select
                                                value={editingBlueprint!.align}
                                                onChange={e => setEditingBlueprint({ ...editingBlueprint!, align: e.target.value as 'left' | 'right' })}
                                                className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                                            >
                                                <option value="left">Left</option>
                                                <option value="right">Right</option>
                                            </select>
                                        </div>
                                    </div>
                                    <textarea
                                        value={editingBlueprint!.description}
                                        onChange={e => setEditingBlueprint({ ...editingBlueprint!, description: e.target.value })}
                                        className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-300 h-20 resize-none"
                                        placeholder="Description"
                                    />
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => setEditingBlueprint(null)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                        <button onClick={handleUpdateBlueprint} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Save Changes</button>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={item.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col md:flex-row gap-6 relative group">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingBlueprint(item)} className="text-gray-500 hover:text-purple-400"><FiEdit2 /></button>
                                    <button onClick={() => handleDeleteBlueprint(item.id)} className="text-gray-500 hover:text-red-500"><FiTrash2 /></button>
                                </div>
                                <div className="shrink-0 flex items-center justify-center w-16 h-16 bg-gray-900 rounded-lg border border-gray-700 text-purple-400">
                                    <Icon className="text-3xl" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-white">{item.title}</h3>
                                        <span className="text-xs uppercase bg-gray-900 text-gray-400 px-2 py-1 rounded border border-gray-700">
                                            {item.align}
                                        </span>
                                    </div>
                                    <p className="text-gray-400">{item.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* --- Social Media Section --- */}
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FiGlobe className="text-blue-400" /> Social Media Links
                    </h2>
                    <button
                        onClick={handleUpdateSocials}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        <FiSave /> Save Changes
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs uppercase text-gray-400 mb-1">Instagram URL</label>
                        <input
                            value={settings.instagram_url}
                            onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                            placeholder="https://instagram.com/..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-400 mb-1">LinkedIn URL</label>
                        <input
                            value={settings.linkedin_url}
                            onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                            placeholder="https://linkedin.com/..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-400 mb-1">Twitter / X URL</label>
                        <input
                            value={settings.twitter_url}
                            onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                            placeholder="https://twitter.com/..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-400 mb-1">Facebook URL</label>
                        <input
                            value={settings.facebook_url}
                            onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                            placeholder="https://facebook.com/..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-400 mb-1">YouTube URL</label>
                        <input
                            value={settings.youtube_url}
                            onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                            placeholder="https://youtube.com/..."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
