'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { Database } from '@/lib/supabase/types';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

type Pass = Database['public']['Tables']['esummit_passes']['Row'];

export default function PassesList({ initialPasses }: { initialPasses: Pass[] }) {
    const [passes, setPasses] = useState<Pass[]>(initialPasses);
    const [loading, setLoading] = useState<string | null>(null);
    const supabase = createClient();

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        setLoading(id);
        const { error } = await supabase
            .from('esummit_passes')
            .update({ is_active: !currentStatus })
            .eq('id', id);

        if (error) {
            toast.error('Failed to update pass status');
            console.error(error);
        } else {
            toast.success(`Pass ${currentStatus ? 'deactivated' : 'activated'} successfully`);
            setPasses(passes.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
        }
        setLoading(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this pass? This action cannot be undone.')) return;

        setLoading(id);
        const { error } = await supabase
            .from('esummit_passes')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Failed to delete pass');
            console.error(error);
        } else {
            toast.success('Pass deleted successfully');
            setPasses(passes.filter(p => p.id !== id));
        }
        setLoading(null);
    };

    return (
        <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-800/50 text-gray-400 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Price</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {passes.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No passes found. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            passes.map((pass) => (
                                <tr key={pass.id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{pass.name}</div>
                                        <div className="text-sm text-gray-500 truncate max-w-xs">{pass.description}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-emerald-400">
                                        ₹{pass.price}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${pass.is_active
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                            {pass.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-3 text-lg">
                                            <button
                                                onClick={() => handleToggleActive(pass.id, pass.is_active)}
                                                disabled={loading === pass.id}
                                                className={`${pass.is_active ? 'text-emerald-400 hover:text-emerald-300' : 'text-gray-500 hover:text-gray-400'} transition-colors disabled:opacity-50`}
                                                title={pass.is_active ? 'Deactivate Pass' : 'Activate Pass'}
                                            >
                                                {pass.is_active ? <FiToggleRight /> : <FiToggleLeft />}
                                            </button>
                                            <Link
                                                href={`/esummit/admin/passes/${pass.id}/edit`}
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                                title="Edit Pass"
                                            >
                                                <FiEdit2 />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(pass.id)}
                                                disabled={loading === pass.id}
                                                className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                                                title="Delete Pass"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
