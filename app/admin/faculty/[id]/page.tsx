'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient, type Database } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/supabase/storage';
import toast from 'react-hot-toast';
import { FiUpload, FiX } from 'react-icons/fi';

export default function EditFacultyMember() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        email: '',
        linkedin_url: '',
        order_index: 0,
        image_url: '',
    });

    useEffect(() => {
        if (id) fetchMember();
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
                email: data.email || '',
                linkedin_url: data.linkedin_url || '',
                order_index: data.order_index,
                image_url: data.image_url || '',
            });

            if (data.image_url) {
                setImagePreview(data.image_url);
            }
        } catch (error: any) {
            toast.error('Failed to load faculty advisor');
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
            if (imageFile) {
                imageUrl = await uploadImage(imageFile, 'team-images', formData.image_url);
            }

            const { error } = await supabase
                .from('team_members')
                .update({
                    ...formData,
                    image_url: imageUrl,
                    category: 'faculty',
                })
                .eq('id', id);

            if (error) throw error;

            toast.success('Faculty advisor updated!');
            router.push('/admin/faculty');
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
                <h1 className="text-3xl font-heading text-primary-green mb-2">Edit Faculty Advisor</h1>
                <p className="text-gray-600">Update faculty advisor details</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                        <div className="flex items-center gap-6">
                            {imagePreview ? (
                                <div className="relative">
                                    <img src={imagePreview} alt="Preview" className="w-32 h-32 rounded-full object-cover" crossOrigin="anonymous" />
                                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-sm">
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
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                        <input type="text" required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                        <input type="url" value={formData.linkedin_url} onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                        <input 
                            type="number" 
                            value={isNaN(formData.order_index) ? '' : formData.order_index} 
                            onChange={e => setFormData({ ...formData, order_index: e.target.value === '' ? 0 : parseInt(e.target.value) })} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent" 
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-primary-golden to-yellow-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50">
                            {loading ? 'Updating...' : 'Update Faculty Advisor'}
                        </button>
                        <button type="button" onClick={() => router.back()} className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
