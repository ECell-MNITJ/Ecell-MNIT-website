'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ImpactMetric {
    id: string;
    label: string;
    value: string;
    description: string | null;
    display_order: number;
}

export default function AdminImpactPage() {
    const [metrics, setMetrics] = useState<ImpactMetric[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<ImpactMetric>>({
        label: '',
        value: '',
        description: '',
        display_order: 0
    });

    const supabase = createClient();

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('impact_metrics')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            toast.error('Failed to fetch metrics');
            console.error(error);
        } else {
            setMetrics(data || []);
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        if (!formData.label || !formData.value) {
            toast.error('Label and Value are required');
            return;
        }

        try {
            if (isEditing) {
                const { error } = await supabase
                    .from('impact_metrics')
                    .update({
                        label: formData.label,
                        value: formData.value,
                        description: formData.description,
                        display_order: formData.display_order
                    })
                    .eq('id', isEditing);

                if (error) throw error;
                toast.success('Metric updated');
            } else {
                const { error } = await supabase
                    .from('impact_metrics')
                    .insert([{
                        label: formData.label,
                        value: formData.value,
                        description: formData.description,
                        display_order: formData.display_order || metrics.length + 1
                    }]);

                if (error) throw error;
                toast.success('Metric created');
            }

            setIsEditing(null);
            setIsAdding(false);
            setFormData({ label: '', value: '', description: '', display_order: 0 });
            fetchMetrics();
        } catch (error) {
            toast.error('Operation failed');
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this metric?')) return;

        try {
            const { error } = await supabase
                .from('impact_metrics')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Metric deleted');
            fetchMetrics();
        } catch (error) {
            toast.error('Delete failed');
            console.error(error);
        }
    };

    const startEdit = (metric: ImpactMetric) => {
        setIsEditing(metric.id);
        setFormData(metric);
        setIsAdding(false);
    };

    return (
        <div className="p-8 ml-64 min-h-screen bg-gray-900 text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-heading text-primary-golden">Your Impact & Stats</h1>
                <button
                    onClick={() => { setIsAdding(true); setIsEditing(null); setFormData({ label: '', value: '', description: '', display_order: metrics.length + 1 }); }}
                    className="flex items-center gap-2 bg-primary-green hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <FiPlus /> Add Metric
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map((metric) => (
                    <div key={metric.id} className="bg-white/5 border border-white/10 p-6 rounded-xl relative group">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(metric)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white">
                                <FiEdit2 />
                            </button>
                            <button onClick={() => handleDelete(metric.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white">
                                <FiTrash2 />
                            </button>
                        </div>

                        <div className="text-4xl font-bold text-primary-golden mb-2">{metric.value}</div>
                        <div className="text-xl font-semibold text-white mb-2">{metric.label}</div>
                        <p className="text-gray-400 text-sm">{metric.description}</p>
                        <div className="mt-4 text-xs text-gray-500">Order: {metric.display_order}</div>
                    </div>
                ))}
            </div>

            {/* Edit/Add Modal (Simplified as inline overlay for now) */}
            {(isAdding || isEditing) && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
                    <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md border border-white/10">
                        <h2 className="text-2xl font-bold mb-6 text-white">{isEditing ? 'Edit Metric' : 'Add Metric'}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Value (e.g. 50+)</label>
                                <input
                                    type="text"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary-golden outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Label (e.g. Events)</label>
                                <input
                                    type="text"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary-golden outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Description (Optional)</label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary-golden outline-none h-24"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Display Order</label>
                                <input
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary-golden outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-primary-golden text-black font-bold py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => { setIsAdding(false); setIsEditing(null); }}
                                className="flex-1 bg-transparent border border-gray-600 text-white py-2 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
