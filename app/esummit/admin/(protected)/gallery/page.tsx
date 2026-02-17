'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { uploadImage, deleteImage } from '@/lib/supabase/storage';
import { FiTrash2, FiUpload, FiImage, FiFilter, FiPlus, FiFolder, FiX, FiLayers } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface GallerySection {
    id: string;
    title: string;
    source: 'ecell' | 'esummit';
    display_order: number;
}

interface GalleryCollection {
    id: string;
    title: string;
    description: string | null;
    date: string;
    cover_image_url: string | null;
    section_id: string | null;
    category: 'ecell' | 'esummit';
}

interface GalleryImage {
    id: string;
    image_url: string;
    caption: string | null;
    category: 'ecell' | 'esummit';
    section_id: string | null;
    collection_id: string | null;
    created_at: string;
}

export default function ESummitGalleryAdmin() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [sections, setSections] = useState<GallerySection[]>([]);
    const [collections, setCollections] = useState<GalleryCollection[]>([]);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Filters - Default strictly to esummit
    const filter = 'esummit';
    const [selectedSection, setSelectedSection] = useState<string>('all');
    const [selectedCollection, setSelectedCollection] = useState<string>('all');

    // UI States
    const [isCreatingSection, setIsCreatingSection] = useState(false);
    const [isCreatingCollection, setIsCreatingCollection] = useState(false);

    // New Section Form
    const [newSectionTitle, setNewSectionTitle] = useState('');

    // New Collection Form
    const [newCollectionTitle, setNewCollectionTitle] = useState('');
    const [newCollectionSection, setNewCollectionSection] = useState<string>('');

    // Upload State
    const [uploadSection, setUploadSection] = useState<string>('');
    const [uploadCollection, setUploadCollection] = useState<string>('');

    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchImages(), fetchSections(), fetchCollections()]);
        setLoading(false);
    };

    const fetchImages = async () => {
        try {
            const { data, error } = await supabase
                .from('gallery_images')
                .select('*')
                .eq('category', 'esummit') // Filter by esummit
                .order('created_at', { ascending: false });

            if (error) throw error;
            setImages(data || []);
        } catch (error) {
            console.error('Error fetching gallery:', error);
        }
    };

    const fetchSections = async () => {
        try {
            const { data, error } = await supabase
                .from('gallery_sections')
                .select('*')
                .eq('source', 'esummit') // Filter by esummit
                .order('display_order', { ascending: true })
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSections(data || []);
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    const fetchCollections = async () => {
        try {
            const { data, error } = await supabase
                .from('gallery_collections')
                .select('*')
                .eq('category', 'esummit') // Filter by esummit
                .order('date', { ascending: false });

            if (error) throw error;
            setCollections(data || []);
        } catch (error) {
            console.error('Error fetching collections:', error);
        }
    };

    // --- Actions ---

    const handleCreateSection = async () => {
        if (!newSectionTitle.trim()) return;
        try {
            const { data, error } = await supabase
                .from('gallery_sections')
                .insert({ title: newSectionTitle, source: 'esummit' })
                .select()
                .single();
            if (error) throw error;
            setSections([...sections, data]);
            setNewSectionTitle('');
            setIsCreatingSection(false);
            toast.success('Section created');
        } catch (error) {
            toast.error('Failed to create section');
        }
    };

    const handleCreateCollection = async () => {
        if (!newCollectionTitle.trim()) return;
        try {
            const { data, error } = await supabase
                .from('gallery_collections')
                .insert({
                    title: newCollectionTitle,
                    section_id: newCollectionSection || null,
                    category: 'esummit'
                })
                .select()
                .single();
            if (error) throw error;
            setCollections([data, ...collections]);
            setNewCollectionTitle('');
            setIsCreatingCollection(false);
            toast.success('Collection created');
        } catch (error) {
            toast.error('Failed to create collection');
        }
    };

    const handleDeleteSection = async (id: string) => {
        if (!confirm('Delete section?')) return;
        try {
            const { error } = await supabase.from('gallery_sections').delete().eq('id', id);
            if (error) throw error;
            setSections(sections.filter(s => s.id !== id));
            setImages(images.map(img => img.section_id === id ? { ...img, section_id: null } : img));
            toast.success('Section deleted');
        } catch (error) {
            toast.error('Failed');
        }
    };

    const handleDeleteCollection = async (id: string) => {
        if (!confirm('Delete collection? Images inside will be deleted too (cascade).')) return;
        try {
            const { error } = await supabase.from('gallery_collections').delete().eq('id', id);
            if (error) throw error;
            setCollections(collections.filter(c => c.id !== id));
            setImages(images.filter(img => img.collection_id !== id));
            toast.success('Collection deleted');
        } catch (error) {
            toast.error('Failed');
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        let successCount = 0;

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.size > 5 * 1024 * 1024) continue;

                let sectionId = uploadSection || null;
                let collectionId = uploadCollection || null;

                // Inherit from collection if selected
                if (collectionId) {
                    const col = collections.find(c => c.id === collectionId);
                    if (col) {
                        sectionId = col.section_id;
                    }
                }

                const url = await uploadImage(file, 'gallery');

                if (url) {
                    const { error } = await supabase.from('gallery_images').insert({
                        image_url: url,
                        category: 'esummit',
                        section_id: sectionId,
                        collection_id: collectionId,
                        caption: ''
                    });

                    if (!error) successCount++;
                }
            }

            if (successCount > 0) {
                toast.success(`Uploaded ${successCount} images`);
                fetchImages();
            }
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async (id: string, url: string) => {
        if (!confirm('Delete image?')) return;
        try {
            await deleteImage(url, 'gallery');
            await supabase.from('gallery_images').delete().eq('id', id);
            setImages(images.filter(img => img.id !== id));
            toast.success('Deleted');
        } catch (error) {
            toast.error('Failed');
        }
    };

    const handleUpdate = async (id: string, updates: Partial<GalleryImage>) => {
        try {
            await supabase.from('gallery_images').update(updates).eq('id', id);
            setImages(images.map(img => img.id === id ? { ...img, ...updates } : img));
            toast.success('Updated');
        } catch (error) {
            toast.error('Failed');
        }
    };

    const displayImages = images.filter(img => {
        if (selectedSection !== 'all') {
            if (selectedSection === 'uncategorized') { if (img.section_id) return false; }
            else { if (img.section_id !== selectedSection) return false; }
        }
        if (selectedCollection !== 'all') {
            if (selectedCollection === 'uncategorized') { if (img.collection_id) return false; }
            else { if (img.collection_id !== selectedCollection) return false; }
        }
        return true;
    });

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-heading text-purple-400">E-Summit Gallery</h1>
                <p className="text-gray-400">Manage photos specifically for E-Summit.</p>
            </div>

            {/* Controls */}
            <div className="bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-800 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">

                {/* Left: Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg py-2 pl-3 pr-8 focus:ring-purple-500 focus:border-purple-500"
                    >
                        <option value="all">All Sections</option>
                        <option value="uncategorized">No Section</option>
                        {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>

                    <select
                        value={selectedCollection}
                        onChange={(e) => setSelectedCollection(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg py-2 pl-3 pr-8 focus:ring-purple-500 focus:border-purple-500"
                    >
                        <option value="all">All Collections</option>
                        <option value="uncategorized">No Collection</option>
                        {collections.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => setIsCreatingSection(!isCreatingSection)} className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-300 transition-colors">
                        <FiFolder /> Sections
                    </button>
                    <button onClick={() => setIsCreatingCollection(!isCreatingCollection)} className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-300 transition-colors">
                        <FiLayers /> Collections
                    </button>

                    <label className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-white text-sm cursor-pointer transition-all ${uploading ? 'bg-gray-600' : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-900/20'}`}>
                        {uploading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <FiUpload />}
                        {uploading ? 'Uploading...' : 'Upload'}
                        <input type="file" multiple accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
                    </label>
                </div>
            </div>

            {/* Create Section Panel */}
            {isCreatingSection && (
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 relative animate-fade-in-down">
                    <button onClick={() => setIsCreatingSection(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white"><FiX /></button>
                    <h3 className="font-bold mb-3 flex items-center gap-2 text-white"><FiFolder className="text-purple-400" /> Create Section</h3>
                    <div className="flex gap-2">
                        <input
                            value={newSectionTitle}
                            onChange={e => setNewSectionTitle(e.target.value)}
                            placeholder="Section Title"
                            className="flex-1 px-3 py-2 rounded bg-gray-900 border border-gray-700 text-white focus:ring-purple-500 focus:border-purple-500"
                        />
                        <button onClick={handleCreateSection} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Create</button>
                    </div>
                </div>
            )}

            {/* Create Collection Panel */}
            {isCreatingCollection && (
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 relative animate-fade-in-down">
                    <button onClick={() => setIsCreatingCollection(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white"><FiX /></button>
                    <h3 className="font-bold mb-3 flex items-center gap-2 text-white"><FiLayers className="text-blue-400" /> Create Collection</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <input
                            value={newCollectionTitle}
                            onChange={e => setNewCollectionTitle(e.target.value)}
                            placeholder="Collection Title"
                            className="md:col-span-2 px-3 py-2 rounded bg-gray-900 border border-gray-700 text-white focus:ring-purple-500 focus:border-purple-500"
                        />
                        <select
                            value={newCollectionSection}
                            onChange={e => setNewCollectionSection(e.target.value)}
                            className="px-3 py-2 rounded bg-gray-900 border border-gray-700 text-white focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="">No Section</option>
                            {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                        </select>
                        <button onClick={handleCreateCollection} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create</button>
                    </div>
                </div>
            )}

            {/* Upload Target Settings */}
            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800 flex flex-wrap items-center gap-3 text-sm">
                <span className="font-bold text-gray-400">Upload Target:</span>
                <select
                    value={uploadSection}
                    onChange={e => setUploadSection(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-gray-300 rounded px-2 py-1 focus:ring-purple-500"
                >
                    <option value="">Uncategorized Section</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
                <span className="text-gray-500">+</span>
                <select
                    value={uploadCollection}
                    onChange={e => setUploadCollection(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-gray-300 rounded px-2 py-1 focus:ring-purple-500"
                >
                    <option value="">No Collection</option>
                    {collections.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
            </div>

            {/* Image Grid */}
            {loading ? <div className="text-center py-10 text-gray-400">Loading gallery...</div> : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {displayImages.map(img => (
                        <div key={img.id} className="group relative aspect-square bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-purple-500/50 transition-colors">
                            <img src={img.image_url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button onClick={() => handleDelete(img.id, img.image_url)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><FiTrash2 /></button>
                            </div>
                            <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                                <select
                                    value={img.collection_id || ''}
                                    onChange={(e) => handleUpdate(img.id, { collection_id: e.target.value || null })}
                                    className="w-full text-xs bg-black/40 text-gray-200 border-none rounded focus:ring-0 mb-1 cursor-pointer hover:bg-black/60"
                                >
                                    <option value="">No Collection</option>
                                    {collections.map(c => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={img.caption || ''}
                                    onChange={(e) => handleUpdate(img.id, { caption: e.target.value })}
                                    placeholder="Add caption"
                                    className="w-full text-xs bg-transparent text-white border-b border-white/20 px-0 py-1 focus:border-purple-500 focus:ring-0 placeholder:text-gray-500"
                                    onClick={e => e.stopPropagation()}
                                />
                            </div>
                        </div>
                    ))}
                    {displayImages.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
                            <FiImage className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No images found in this view.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
