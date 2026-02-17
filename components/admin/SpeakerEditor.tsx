'use client';

import { useState } from 'react';
import { FiPlus, FiTrash2, FiUser, FiLinkedin, FiTwitter, FiUpload, FiX } from 'react-icons/fi';
import { Speaker } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/supabase/storage';
import toast from 'react-hot-toast';

interface SpeakerEditorProps {
    speakers: Speaker[];
    onChange: (speakers: Speaker[]) => void;
}

export default function SpeakerEditor({ speakers, onChange }: SpeakerEditorProps) {
    const [newItem, setNewItem] = useState<Partial<Speaker>>({
        name: '',
        role: '',
        company: '',
        bio: '',
        image_url: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image must be less than 2MB');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAdd = async () => {
        if (!newItem.name || !newItem.role) return;
        setUploading(true);

        try {
            let imageUrl = newItem.image_url || null;

            if (imageFile) {
                const path = `speakers/${Date.now()}-${imageFile.name}`;
                imageUrl = await uploadImage(imageFile, 'event-images', null); // Reuse event-images bucket for now, or use a separate bucket
            }

            const item: Speaker = {
                id: crypto.randomUUID(),
                name: newItem.name || '',
                role: newItem.role || '',
                company: newItem.company || '',
                bio: newItem.bio || '',
                image_url: imageUrl,
                linkedin_url: newItem.linkedin_url,
                twitter_url: newItem.twitter_url,
            };

            onChange([...speakers, item]);

            // Reset form
            setNewItem({ name: '', role: '', company: '', bio: '', image_url: '' });
            setImageFile(null);
            setImagePreview(null);
        } catch (error) {
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (id: string) => {
        onChange(speakers.filter((item) => item.id !== id));
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-300">Speakers</h3>

            {/* List */}
            <div className="grid md:grid-cols-2 gap-4">
                {speakers.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700 relative group">
                        <div className="w-16 h-16 rounded-full bg-gray-700 overflow-hidden shrink-0">
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <FiUser size={24} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white truncate">{item.name}</h4>
                            <p className="text-sm text-primary-golden truncate">{item.role}</p>
                            <p className="text-xs text-gray-400 truncate">{item.company}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="absolute top-2 right-2 p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 rounded-full shadow-sm hover:bg-gray-800"
                        >
                            <FiTrash2 />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add New */}
            <div className="p-4 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
                <div className="flex gap-6 mb-4">
                    {/* Image Upload */}
                    <div className="shrink-0">
                        <div className="w-24 h-24 rounded-full bg-gray-700 relative overflow-hidden group">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <FiUser size={32} />
                                </div>
                            )}
                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                <FiUpload />
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="flex-1 grid md:grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="Name *"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            className="px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-1 focus:ring-primary-golden placeholder-gray-500"
                        />
                        <input
                            type="text"
                            placeholder="Role (e.g. CEO) *"
                            value={newItem.role}
                            onChange={(e) => setNewItem({ ...newItem, role: e.target.value })}
                            className="px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-1 focus:ring-primary-golden placeholder-gray-500"
                        />
                        <input
                            type="text"
                            placeholder="Company"
                            value={newItem.company}
                            onChange={(e) => setNewItem({ ...newItem, company: e.target.value })}
                            className="px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-1 focus:ring-primary-golden placeholder-gray-500"
                        />
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <FiLinkedin className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="url"
                                    placeholder="LinkedIn URL"
                                    value={newItem.linkedin_url}
                                    onChange={(e) => setNewItem({ ...newItem, linkedin_url: e.target.value })}
                                    className="w-full pl-9 px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-1 focus:ring-primary-golden text-sm placeholder-gray-500"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <textarea
                                placeholder="Short Bio"
                                value={newItem.bio}
                                onChange={(e) => setNewItem({ ...newItem, bio: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-1 focus:ring-primary-golden placeholder-gray-500"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={uploading || !newItem.name || !newItem.role}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-gray-900 border border-primary-golden text-primary-golden rounded-lg hover:bg-primary-golden/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {uploading ? 'Uploading...' : <><FiPlus /> Add Speaker</>}
                </button>
            </div>
        </div>
    );
}
