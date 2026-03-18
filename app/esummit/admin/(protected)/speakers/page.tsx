'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiUsers, FiPlus, FiTrash2, FiEdit2, FiSave, FiLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ESummitSpeaker {
    id: string;
    name: string;
    image_url: string | null;
    designation: string | null;
    linkedin_url: string | null;
    display_order: number;
}

export default function SpeakersAdminPage() {
    const [speakers, setSpeakers] = useState<ESummitSpeaker[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Settings State
    const [settings, setSettings] = useState<{
        show_speakers: boolean;
        speakers_heading: string;
    }>({
        show_speakers: true,
        speakers_heading: 'Eminent Speakers'
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    // Form State
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesignation, setNewDesignation] = useState('');
    const [newLinkedin, setNewLinkedin] = useState('');
    const [newImage, setNewImage] = useState<File | null>(null);

    // Editing State
    const [editingSpeaker, setEditingSpeaker] = useState<ESummitSpeaker | null>(null);
    const [editImage, setEditImage] = useState<File | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchSpeakers(), fetchSettings()]);
        setLoading(false);
    };

    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from('esummit_settings')
            .select('show_speakers, speakers_heading')
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching settings:', error);
        } else if (data) {
            const typedData = data as any;
            setSettings({
                show_speakers: typedData.show_speakers !== undefined ? typedData.show_speakers : true,
                speakers_heading: typedData.speakers_heading || 'Eminent Speakers'
            });
        }
    };

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        const { error } = await supabase
            .from('esummit_settings')
            .update({
                show_speakers: settings.show_speakers,
                speakers_heading: settings.speakers_heading,
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

    const fetchSpeakers = async () => {
        const { data, error } = await supabase
            .from('esummit_speakers')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching speakers:', error);
            toast.error('Failed to load speakers');
        } else {
            setSpeakers(data || []);
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

    const handleAddSpeaker = async () => {
        if (!newName.trim()) {
            toast.error("Speaker name is required.");
            return;
        }

        try {
            let imageUrl = null;
            if (newImage) {
                imageUrl = await uploadImage(newImage);
            }

            const { data, error } = await supabase
                .from('esummit_speakers')
                .insert({
                    name: newName,
                    designation: newDesignation,
                    linkedin_url: newLinkedin,
                    image_url: imageUrl,
                    display_order: speakers.length
                })
                .select()
                .single();

            if (error) throw error;

            setSpeakers([...speakers, data]);
            setNewName('');
            setNewDesignation('');
            setNewLinkedin('');
            setNewImage(null);
            setIsAdding(false);
            toast.success('Speaker added successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to add speaker');
        }
    };

    const handleDeleteSpeaker = async (id: string) => {
        if (!confirm('Are you sure you want to delete this speaker?')) return;
        try {
            const { error } = await supabase.from('esummit_speakers').delete().eq('id', id);
            if (error) throw error;
            setSpeakers(speakers.filter(s => s.id !== id));
            toast.success('Speaker deleted');
        } catch (error) {
            toast.error('Failed to delete speaker');
        }
    };

    const handleUpdateSpeaker = async () => {
        if (!editingSpeaker) return;

        try {
            let imageUrl = editingSpeaker.image_url;
            if (editImage) {
                imageUrl = await uploadImage(editImage);
            }

            const { error } = await supabase
                .from('esummit_speakers')
                .update({
                    name: editingSpeaker.name,
                    designation: editingSpeaker.designation,
                    linkedin_url: editingSpeaker.linkedin_url,
                    image_url: imageUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingSpeaker.id);

            if (error) throw error;

            setSpeakers(speakers.map(s => s.id === editingSpeaker.id ? { ...editingSpeaker, image_url: imageUrl } : s));
            setEditingSpeaker(null);
            setEditImage(null);
            toast.success('Speaker updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update speaker');
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

    return (
        <div className="space-y-12 pb-20 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-heading text-blue-400">Speakers Management</h1>
                <p className="text-gray-400">Manage the speakers marquee displayed on the E-Summit home page.</p>
            </div>

            {/* Visibility Settings Section */}
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FiUsers className="text-blue-400" /> Marquee Settings
                    </h2>
                    <button
                        onClick={handleSaveSettings}
                        disabled={isSavingSettings}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {isSavingSettings ? 'Saving...' : <><FiSave /> Save</>}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs uppercase text-gray-400 mb-1">Section Heading</label>
                        <input
                            value={settings.speakers_heading}
                            onChange={(e) => setSettings({ ...settings, speakers_heading: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                            placeholder="Eminent Speakers"
                        />
                    </div>
                    <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <div>
                            <span className="block font-bold text-white">Show Speakers Marquee</span>
                            <span className="text-xs text-gray-400">Toggle visibility on the home page</span>
                        </div>
                        <button
                            onClick={() => setSettings(prev => ({ ...prev, show_speakers: !prev.show_speakers }))}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.show_speakers ? 'bg-blue-600' : 'bg-gray-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.show_speakers ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Speakers List Section */}
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        Speakers List
                    </h2>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        {isAdding ? 'Cancel' : <><FiPlus /> Add Speaker</>}
                    </button>
                </div>

                {isAdding && (
                    <div className="mb-8 bg-gray-800 p-6 rounded-xl border border-gray-700 animate-fade-in-down">
                        <h3 className="font-bold text-white mb-4">New Speaker</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase text-gray-400 mb-1">Name *</label>
                                <input
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none"
                                    placeholder="Speaker Name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-400 mb-1">Designation</label>
                                <input
                                    value={newDesignation}
                                    onChange={e => setNewDesignation(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none"
                                    placeholder="e.g. CEO at Company"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-400 mb-1">LinkedIn URL</label>
                                <input
                                    value={newLinkedin}
                                    onChange={e => setNewLinkedin(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none"
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-400 mb-1">Speaker Image</label>
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
                                onClick={handleAddSpeaker}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold"
                            >
                                Save Speaker
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {speakers.length === 0 && !isAdding && (
                        <div className="text-center py-8 text-gray-500">
                            No speakers added yet. Click 'Add Speaker' to get started.
                        </div>
                    )}

                    {speakers.map((speaker) => {
                        const isEditing = editingSpeaker?.id === speaker.id;

                        if (isEditing) {
                            return (
                                <div key={speaker.id} className="bg-gray-800 p-6 rounded-xl border border-blue-500/50 flex flex-col gap-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs uppercase text-gray-400 mb-1">Name</label>
                                            <input
                                                value={editingSpeaker!.name}
                                                onChange={e => setEditingSpeaker({ ...editingSpeaker!, name: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                                                placeholder="Name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase text-gray-400 mb-1">Designation</label>
                                            <input
                                                value={editingSpeaker!.designation || ''}
                                                onChange={e => setEditingSpeaker({ ...editingSpeaker!, designation: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                                                placeholder="Designation"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase text-gray-400 mb-1">LinkedIn URL</label>
                                            <input
                                                value={editingSpeaker!.linkedin_url || ''}
                                                onChange={e => setEditingSpeaker({ ...editingSpeaker!, linkedin_url: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase text-gray-400 mb-1">New Image (Optional)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-white"
                                            />
                                            {speaker.image_url && !editImage && (
                                                <div className="mt-2 text-xs text-gray-400">Current image: <a href={speaker.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View</a></div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-2">
                                        <button onClick={() => { setEditingSpeaker(null); setEditImage(null); }} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                        <button onClick={handleUpdateSpeaker} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={speaker.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col md:flex-row items-center gap-6 relative group">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingSpeaker(speaker)} className="p-2 bg-gray-700 rounded text-gray-300 hover:text-blue-400"><FiEdit2 size={14} /></button>
                                    <button onClick={() => handleDeleteSpeaker(speaker.id)} className="p-2 bg-gray-700 rounded text-gray-300 hover:text-red-500"><FiTrash2 size={14} /></button>
                                </div>

                                <div className="shrink-0 w-24 h-24 bg-gray-900 rounded-full border border-gray-700 flex items-center justify-center p-1 overflow-hidden">
                                    {speaker.image_url ? (
                                        <img src={speaker.image_url} alt={speaker.name} className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <span className="text-xs text-gray-500 font-bold">{speaker.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-xl font-bold text-white">{speaker.name}</h3>
                                    {speaker.designation && <p className="text-gray-400 text-sm mt-1">{speaker.designation}</p>}
                                    {speaker.linkedin_url && (
                                        <a href={speaker.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:underline mt-1">
                                            <FiLink size={12} /> {speaker.linkedin_url.replace(/^https?:\/\//, '')}
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
