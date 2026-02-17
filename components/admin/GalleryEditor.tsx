'use client';

import { useState } from 'react';
import { FiPlus, FiTrash2, FiImage, FiX } from 'react-icons/fi';
import { GalleryImage } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/supabase/storage';
import toast from 'react-hot-toast';

interface GalleryEditorProps {
    gallery: GalleryImage[];
    onChange: (gallery: GalleryImage[]) => void;
}

export default function GalleryEditor({ gallery, onChange }: GalleryEditorProps) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const newImages: GalleryImage[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`Skipped ${file.name}: >5MB`);
                    continue;
                }

                const url = await uploadImage(file, 'event-images');
                if (url) {
                    newImages.push({
                        id: crypto.randomUUID(),
                        url: url,
                        caption: '',
                    });
                }
            }

            onChange([...gallery, ...newImages]);
            toast.success(`Uploaded ${newImages.length} images`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload some images');
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDelete = (id: string) => {
        onChange(gallery.filter((item) => item.id !== id));
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-300">Photo Gallery</h3>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gallery.map((item) => (
                    <div key={item.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
                        <img src={item.url} alt="Gallery" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 translate-y-full group-hover:translate-y-0 transition-transform">
                            <input
                                type="text"
                                value={item.caption || ''}
                                onChange={(e) => {
                                    const newGallery = gallery.map((g) =>
                                        g.id === item.id ? { ...g, caption: e.target.value } : g
                                    );
                                    onChange(newGallery);
                                }}
                                placeholder="Add caption..."
                                className="w-full bg-transparent text-white text-xs border-b border-white/30 focus:border-white outline-none placeholder:text-gray-400"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                ))}

                {/* Upload Button */}
                <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/50 hover:border-primary-golden hover:bg-primary-golden/5 cursor-pointer transition-all">
                    {uploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-golden border-t-transparent mb-2"></div>
                    ) : (
                        <FiImage className="w-8 h-8 text-gray-400 mb-2" />
                    )}
                    <span className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Add Photos'}</span>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleUpload}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
            </div>
        </div>
    );
}
