'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Database } from '@/lib/supabase/types';
import { FiCheck, FiX } from 'react-icons/fi';

type PassInsert = Database['public']['Tables']['esummit_passes']['Insert'];
type PassRow = Database['public']['Tables']['esummit_passes']['Row'];

interface PassFormProps {
    initialData?: PassRow;
    isEditing?: boolean;
}

export default function PassForm({ initialData, isEditing = false }: PassFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [globalFeatures, setGlobalFeatures] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        price: initialData?.price || 0,
        description: initialData?.description || '',
        selectedFeatures: initialData?.features || [],
        is_active: initialData?.is_active ?? true,
        is_popular: initialData?.is_popular ?? false,
        display_order: initialData?.display_order || 0
    });

    useEffect(() => {
        const fetchGlobalFeatures = async () => {
            const { data } = await supabase.from('esummit_settings').select('pass_features_list').single();
            if (data?.pass_features_list) {
                setGlobalFeatures(data.pass_features_list);
            }
        };
        fetchGlobalFeatures();
    }, []);

    const toggleFeature = (feature: string) => {
        const current = [...formData.selectedFeatures];
        const index = current.indexOf(feature);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(feature);
        }
        setFormData({ ...formData, selectedFeatures: current });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const passData = {
                name: formData.name,
                price: Number(formData.price),
                description: formData.description,
                features: formData.selectedFeatures,
                is_active: formData.is_active,
                is_popular: formData.is_popular,
                display_order: Number(formData.display_order)
            };

            if (isEditing && initialData) {
                const { error } = await supabase
                    .from('esummit_passes')
                    .update(passData)
                    .eq('id', initialData.id);

                if (error) throw error;
                toast.success('Pass updated successfully');
            } else {
                const { error } = await supabase
                    .from('esummit_passes')
                    .insert(passData);

                if (error) throw error;
                toast.success('Pass created successfully');
            }

            router.push('/esummit/admin/passes');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save pass');
            console.error('Pass form error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl p-8 shadow-lg border border-gray-800 space-y-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-gray-300 mb-2 uppercase tracking-widest text-[10px] font-bold">Pass Name</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="e.g., Gold Pass"
                    />
                </div>

                <div>
                    <label className="block text-gray-300 mb-2 uppercase tracking-widest text-[10px] font-bold">Price (INR)</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-bold"
                    />
                </div>
            </div>

            <div>
                <label className="block text-gray-300 mb-2 uppercase tracking-widest text-[10px] font-bold">Description</label>
                <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Short summary for the pass card"
                />
            </div>

            <div className="pt-4 border-t border-gray-800">
                <label className="block text-yellow-500 mb-4 uppercase tracking-widest text-[10px] font-bold">Features (Right/Wrong Status)</label>
                <p className="text-gray-500 text-xs mb-4">Checked features will show with a green checkmark, unchecked will show with a red cross on the pricing grid.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-4 bg-black/30 rounded-2xl border border-white/5">
                    {globalFeatures.length > 0 ? (
                        globalFeatures.map((feat, i) => {
                            const isIncluded = formData.selectedFeatures.includes(feat);
                            return (
                                <div
                                    key={i}
                                    onClick={() => toggleFeature(feat)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isIncluded
                                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                        : 'bg-red-500/5 border-red-500/10 text-gray-500'
                                        }`}
                                >
                                    <div className={`p-1 rounded-full border ${isIncluded ? 'bg-green-500 border-green-400 text-white' : 'bg-red-500/20 border-red-500/30 text-red-500'}`}>
                                        {isIncluded ? <FiCheck size={12} /> : <FiX size={12} />}
                                    </div>
                                    <span className="text-sm font-medium">{feat}</span>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-8 text-center text-gray-600 text-sm">
                            Manage features in <span className="text-yellow-500 italic">Settings</span> first.
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-800">
                <div>
                    <label className="block text-gray-300 mb-2 uppercase tracking-widest text-[10px] font-bold">Display Order</label>
                    <input
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                </div>

                <div className="flex flex-col gap-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                            onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.is_active ? 'bg-purple-600' : 'bg-gray-700'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-gray-300 font-bold uppercase tracking-widest text-[10px]">Active Status</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                            onClick={() => setFormData({ ...formData, is_popular: !formData.is_popular })}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.is_popular ? 'bg-yellow-500' : 'bg-gray-700'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.is_popular ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-gray-300 font-bold uppercase tracking-widest text-[10px]">Mark as Popular</span>
                    </label>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-colors uppercase tracking-widest text-[10px] font-bold"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 uppercase tracking-widest text-[10px] font-black shadow-lg shadow-purple-500/20"
                >
                    {loading ? 'Saving Changes...' : (isEditing ? 'Update Pass' : 'Create Pass')}
                </button>
            </div>
        </form >
    );
}

