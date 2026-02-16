'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, type Database } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/supabase/storage';
import toast from 'react-hot-toast';
import { FiUpload, FiX } from 'react-icons/fi';

export default function NewStartup() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    // Image state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        website_url: '',
        founder_names: '',
        founded_year: '',
        status: 'active',
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Logo must be less than 2MB');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let logoUrl = null;

            if (imageFile) {
                logoUrl = await uploadImage(imageFile, 'startup-logos');
            }

            const startupData: Database['public']['Tables']['startups']['Insert'] = {
                name: formData.name,
                description: formData.description,
                website_url: formData.website_url,
                founder_names: formData.founder_names,
                founded_year: formData.founded_year,
                status: formData.status,
                logo_url: logoUrl,
            };

            const { error } = await supabase
                .from('startups')
                .insert(startupData);

            if (error) throw error;

            toast.success('Startup added successfully!');
            router.push('/admin/startups');
        } catch (error: any) {
            toast.error(error.message || 'Failed to create startup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-heading text-primary-green mb-2">
                    Add New Startup
                </h1>
                <p className="text-gray-600">Register a new incubated startup</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Logo Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Startup Logo</label>
                        <div className="flex items-center gap-6">
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-24 h-24 rounded-lg object-contain border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImageFile(null);
                                            setImagePreview(null);
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                    >
                                        <FiX className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                    <FiUpload className="w-6 h-6 text-gray-400" />
                                </div>
                            )}
                            <label className="cursor-pointer bg-primary-golden/10 text-primary-golden px-4 py-2 rounded-lg hover:bg-primary-golden/20 transition-colors">
                                <span>Upload Logo</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Startup Name *</label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            id="description"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
                            placeholder="Brief blurp about what they do..."
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="founded_year" className="block text-sm font-medium text-gray-700 mb-2">Founded Year</label>
                            <input
                                id="founded_year"
                                type="text"
                                value={formData.founded_year}
                                onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
                                placeholder="e.g. 2024"
                            />
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                id="status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
                            >
                                <option value="active">Active</option>
                                <option value="acquired">Acquired</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                        <input
                            id="website_url"
                            type="url"
                            value={formData.website_url}
                            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label htmlFor="founder_names" className="block text-sm font-medium text-gray-700 mb-2">Founders</label>
                        <input
                            id="founder_names"
                            type="text"
                            value={formData.founder_names}
                            onChange={(e) => setFormData({ ...formData, founder_names: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
                            placeholder="e.g. John Doe, Jane Smith"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-primary-golden to-yellow-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Startup'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
