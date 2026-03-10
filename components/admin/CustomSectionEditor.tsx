'use client';

import { useState } from 'react';
import { FiPlus, FiTrash2, FiUser, FiLinkedin, FiUpload, FiX, FiLayers } from 'react-icons/fi';
import { CustomSection, CustomSectionItem } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/supabase/storage';
import toast from 'react-hot-toast';

interface CustomSectionEditorProps {
    sections: CustomSection[];
    onChange: (sections: CustomSection[]) => void;
}

export default function CustomSectionEditor({ sections, onChange }: CustomSectionEditorProps) {
    const [newSectionTitle, setNewSectionTitle] = useState('');

    const handleAddSection = () => {
        if (!newSectionTitle.trim()) return;

        const newSection: CustomSection = {
            id: crypto.randomUUID(),
            title: newSectionTitle.trim().toUpperCase(),
            items: [],
        };

        onChange([...sections, newSection]);
        setNewSectionTitle('');
    };

    const handleDeleteSection = (sectionId: string) => {
        onChange(sections.filter(s => s.id !== sectionId));
    };

    const handleUpdateSectionTitle = (sectionId: string, title: string) => {
        onChange(sections.map(s => s.id === sectionId ? { ...s, title: title.toUpperCase() } : s));
    };

    const handleAddItem = (sectionId: string, item: CustomSectionItem) => {
        onChange(sections.map(s => s.id === sectionId ? { ...s, items: [...s.items, item] } : s));
    };

    const handleDeleteItem = (sectionId: string, itemId: string) => {
        onChange(sections.map(s =>
            s.id === sectionId
                ? { ...s, items: s.items.filter(i => i.id !== itemId) }
                : s
        ));
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FiLayers className="text-purple-500" /> Custom Sections
                </h3>
            </div>

            {sections.map((section) => (
                <div key={section.id} className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <input
                            type="text"
                            value={section.title}
                            onChange={(e) => handleUpdateSectionTitle(section.id, e.target.value)}
                            className="bg-transparent text-lg font-bold text-white border-b border-gray-700 focus:border-purple-500 outline-none px-2 py-1 tracking-wider"
                            placeholder="SECTION TITLE (e.g., JUDGES)"
                        />
                        <button
                            type="button"
                            onClick={() => handleDeleteSection(section.id)}
                            className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                            title="Delete Section"
                        >
                            <FiTrash2 />
                        </button>
                    </div>

                    <SectionItemEditor
                        items={section.items}
                        onAdd={(item) => handleAddItem(section.id, item)}
                        onDelete={(itemId) => handleDeleteItem(section.id, itemId)}
                    />
                </div>
            ))}

            {/* Add New Section */}
            <div className="flex gap-3">
                <input
                    type="text"
                    placeholder="New Section Title (e.g. JUDGES, MENTORS)"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-1 focus:ring-purple-500 placeholder-gray-500"
                />
                <button
                    type="button"
                    onClick={handleAddSection}
                    disabled={!newSectionTitle.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-semibold"
                >
                    <FiPlus /> Add Section
                </button>
            </div>
        </div>
    );
}

interface SectionItemEditorProps {
    items: CustomSectionItem[];
    onAdd: (item: CustomSectionItem) => void;
    onDelete: (itemId: string) => void;
}

function SectionItemEditor({ items, onAdd, onDelete }: SectionItemEditorProps) {
    const [newItem, setNewItem] = useState<Partial<CustomSectionItem>>({
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

    const handleAddItem = async () => {
        if (!newItem.name || !newItem.role) return;
        setUploading(true);

        try {
            let imageUrl = newItem.image_url || null;

            if (imageFile) {
                imageUrl = await uploadImage(imageFile, 'event-images', null);
            }

            const item: CustomSectionItem = {
                id: crypto.randomUUID(),
                name: newItem.name || '',
                role: newItem.role || '',
                company: newItem.company || '',
                bio: newItem.bio || '',
                image_url: imageUrl,
                linkedin_url: newItem.linkedin_url,
            };

            onAdd(item);

            // Reset
            setNewItem({ name: '', role: '', company: '', bio: '', image_url: '' });
            setImageFile(null);
            setImagePreview(null);
        } catch (error) {
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Items List */}
            <div className="grid md:grid-cols-2 gap-4">
                {items.map((item) => (
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
                            <p className="text-sm text-purple-400 truncate">{item.role}</p>
                            <p className="text-xs text-gray-400 truncate">{item.company}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onDelete(item.id)}
                            className="absolute top-2 right-2 p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-950 rounded-full shadow-sm hover:bg-gray-800"
                        >
                            <FiTrash2 />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add New Item Form */}
            <div className="p-4 bg-gray-950/50 rounded-lg border border-gray-800">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Image Upload */}
                    <div className="shrink-0 flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-gray-800 relative overflow-hidden group border border-gray-700">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    <FiUser size={32} />
                                </div>
                            )}
                            <label className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
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
                            className="px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-1 focus:ring-purple-500 placeholder-gray-500"
                        />
                        <input
                            type="text"
                            placeholder="Role *"
                            value={newItem.role}
                            onChange={(e) => setNewItem({ ...newItem, role: e.target.value })}
                            className="px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-1 focus:ring-purple-500 placeholder-gray-500"
                        />
                        <input
                            type="text"
                            placeholder="Company"
                            value={newItem.company}
                            onChange={(e) => setNewItem({ ...newItem, company: e.target.value })}
                            className="px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-1 focus:ring-purple-500 placeholder-gray-500"
                        />
                        <div className="relative">
                            <FiLinkedin className="absolute left-3 top-3 text-gray-500" />
                            <input
                                type="url"
                                placeholder="LinkedIn URL"
                                value={newItem.linkedin_url}
                                onChange={(e) => setNewItem({ ...newItem, linkedin_url: e.target.value })}
                                className="w-full pl-9 px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-1 focus:ring-purple-500 text-sm placeholder-gray-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <textarea
                                placeholder="Short Bio"
                                value={newItem.bio}
                                onChange={(e) => setNewItem({ ...newItem, bio: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-1 focus:ring-purple-500 placeholder-gray-500 text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <button
                        type="button"
                        onClick={handleAddItem}
                        disabled={uploading || !newItem.name || !newItem.role}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-purple-600/10 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {uploading ? 'Processing...' : <><FiPlus /> Add Item to Section</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
