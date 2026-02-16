'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient, type Database } from '@/lib/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { uploadImage, deleteImage } from '@/lib/supabase/storage';
import toast from 'react-hot-toast';
import { FiUpload, FiX } from 'react-icons/fi';

export default function EditTeamMember() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const supabase = createClient() as SupabaseClient<Database>;
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        role: '',

        bio: '',
        linkedin_url: '',
        twitter_url: '',
        order_index: 0,
        image_url: '',
    });

    useEffect(() => {
        fetchMember();
    }, [id]);

    const fetchMember = async () => {
        try {
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            setFormData({
                name: data.name,
                role: data.role,
                bio: data.bio || '',
                linkedin_url: data.linkedin_url || '',
                twitter_url: data.twitter_url || '',
                order_index: data.order_index,
                image_url: data.image_url || '',
            });
            if (data.image_url) {
                setImagePreview(data.image_url);
            }
        } catch (error: any) {
            toast.error('Failed to load team member');
        } finally {
            setFetching(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image must be less than 5MB');
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
            let imageUrl = formData.image_url;

            // Upload new image if selected
            if (imageFile) {
                imageUrl = await uploadImage(imageFile, 'team-images', formData.image_url);
            }

            // Update team member
            const updateData: Database['public']['Tables']['team_members']['Update'] = {
                name: formData.name,
                role: formData.role,
                bio: formData.bio || null,
                linkedin_url: formData.linkedin_url || null,
                twitter_url: formData.twitter_url || null,
                order_index: formData.order_index,
                image_url: imageUrl,
            };

            const { error } = await (supabase
                .from('team_members') as any)
                .update(updateData)
                .eq('id', id);

            if (error) throw error;

            toast.success('Team member updated!');
            router.push('/admin/team');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-golden border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-heading text-primary-green mb-2">
                    Edit Team Member
                </h1>
                <p className="text-gray-600">Update member details</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload - same as new page */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Profile Image
                        </label>
                        <div className="flex items-center gap-6">
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-32 h-32 rounded-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImageFile(null);
                                            setImagePreview(null);
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                    >
                                        <FiX className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                                    <FiUpload className="w-8 h-8 text-gray-400" />
                                </div>
                            )}
                            <label className="cursor-pointer bg-primary-golden/10 text-primary-golden px-4 py-2 rounded-lg hover:bg-primary-golden/20 transition-colors">
                                <span>Change Image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Form fields - same structure as new page */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
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
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                        <input
                            id="role"
                            type="text"
                            required
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
                        />
                    </div>



                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <textarea
                            id="bio"
                            rows={4}
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                        <input
                            id="linkedin"
                            type="url"
                            value={formData.linkedin_url}
                            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2">Twitter URL</label>
                        <input
                            id="twitter"
                            type="url"
                            value={formData.twitter_url}
                            onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                        <input
                            id="order"
                            type="number"
                            value={formData.order_index}
                            onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-primary-golden to-yellow-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update Team Member'}
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
