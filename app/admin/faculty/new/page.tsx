'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, type Database } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/supabase/storage';
import toast from 'react-hot-toast';
import { FiUpload, FiX } from 'react-icons/fi';

export default function NewFacultyMember() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        position: '',
        email: '',
        bio: '',
        linkedin_url: '',
        order_index: 0,
    });

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
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error('Session expired. Please login again.');
                router.push('/admin/login');
                return;
            }

            let imageUrl = null;
            if (imageFile) {
                imageUrl = await uploadImage(imageFile, 'team-images');
            }

            const { error } = await supabase.from('team_members').insert({
                ...formData,
                image_url: imageUrl,
                category: 'faculty',
            });

            if (error) throw error;

            toast.success('Faculty advisor added successfully!');
            router.push('/admin/faculty');
        } catch (error: any) {
            toast.error(error.message || 'Failed to add faculty advisor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-heading text-primary-green mb-2">
                    Add Faculty Advisor
                </h1>
                <p className="text-gray-600">Fill in the details for the faculty advisor</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                        <div className="flex items-center gap-6">
                            {imagePreview ? (
                                <div className="relative">
                                    <img src={imagePreview} alt="Preview" className="w-32 h-32 rounded-full object-cover" />
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
                                <span>Choose Image</span>
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
                        <input type="text" required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="e.g., Faculty Advisor" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent" />
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
                            {loading ? 'Adding...' : 'Add Faculty Advisor'}
                        </button>
                        <button type="button" onClick={() => router.back()} className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
