'use client';

import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiX, FiCheck, FiUser } from 'react-icons/fi';
import { Database } from '@/lib/supabase/types';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

type Referral = Database['public']['Tables']['campus_ambassadors']['Row'] & {
    profile?: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
    referral_count?: number;
    checked_in_count?: number;
} & { is_active: boolean };

export default function ReferralsList({ initialReferrals }: { initialReferrals: Referral[] }) {
    const [referrals, setReferrals] = useState<Referral[]>(initialReferrals);
    const [activeTab, setActiveTab] = useState<'applications' | 'ambassadors' | 'rejected' | 'coupons'>('applications');
    const [loading, setLoading] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReferral, setEditingReferral] = useState<Partial<Referral> | null>(null);
    const supabase = createClient();

    const handleAction = async (id: string, updates: any, successMsg: string) => {
        setLoading(id);

        // If approving and code is missing, generate one
        if (updates.status === 'approved' && updates.is_active) {
            const refToUpdate = referrals.find(r => r.id === id);
            if (refToUpdate?.profile_id && !refToUpdate.referral_code) {
                const namePrefix = refToUpdate.profile?.full_name
                    ? refToUpdate.profile.full_name.substring(0, 3).toUpperCase()
                    : refToUpdate.profile_id.substring(0, 3).toUpperCase();
                const randomDigits = Math.floor(1000 + Math.random() * 9000);
                updates.referral_code = `CA${namePrefix}${randomDigits}`;
            }
        }

        // If rejecting, clear the referral code
        if (updates.status === 'rejected') {
            updates.referral_code = null;
            updates.is_active = false;
        }

        const { error } = await supabase
            .from('campus_ambassadors')
            .update(updates)
            .eq('id', id);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success(successMsg);
            setReferrals(referrals.map(r => r.id === id ? { ...r, ...updates } as Referral : r));
        }
        setLoading(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this code?')) return;
        setLoading(id);
        const { error } = await supabase
            .from('campus_ambassadors')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Failed to delete code');
        } else {
            toast.success('Code deleted successfully');
            setReferrals(referrals.filter(r => r.id !== id));
        }
        setLoading(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading('saving');

        if (!editingReferral?.referral_code) {
            toast.error('Referral code is required');
            setLoading(null);
            return;
        }

        const data = {
            referral_code: editingReferral.referral_code.toUpperCase(),
            label: editingReferral.label,
            discount_override: editingReferral.discount_override,
            usage_limit: editingReferral.usage_limit,
            college: editingReferral.college,
            is_active: editingReferral.is_active ?? true,
            status: editingReferral.status || (editingReferral.profile_id ? 'approved' : 'approved'), // Generic codes are auto-approved
        };

        let res;
        if (editingReferral?.id) {
            res = await supabase.from('campus_ambassadors').update(data).eq('id', editingReferral.id).select();
        } else {
            res = await supabase.from('campus_ambassadors').insert(data).select();
        }

        if (res.error) {
            toast.error(res.error.message);
        } else if (!res.data || res.data.length === 0) {
            toast.error('Success, but no data returned. Try refreshing.');
            setIsModalOpen(false);
            setEditingReferral(null);
        } else {
            toast.success('Saved successfully');
            const savedData = { ...res.data[0], is_active: res.data[0].is_active ?? true } as Referral;
            if (editingReferral?.id) {
                setReferrals(referrals.map(r => r.id === editingReferral.id ? savedData : r));
            } else {
                setReferrals([savedData, ...referrals]);
            }
            setIsModalOpen(false);
            setEditingReferral(null);
        }
        setLoading(null);
    };

    const filteredReferrals = referrals.filter(r => {
        if (activeTab === 'applications') return r.status === 'pending' && r.profile_id;
        if (activeTab === 'ambassadors') return r.status === 'approved' && r.profile_id;
        if (activeTab === 'rejected') return r.status === 'rejected' && r.profile_id;
        if (activeTab === 'coupons') return !r.profile_id;
        return false;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'applications' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Waiting List ({referrals.filter(r => r.status === 'pending' && r.profile_id).length})
                    </button>
                    <button
                        onClick={() => setActiveTab('ambassadors')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'ambassadors' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Ambassadors ({referrals.filter(r => r.status === 'approved' && r.profile_id).length})
                    </button>
                    <button
                        onClick={() => setActiveTab('rejected')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'rejected' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Rejected ({referrals.filter(r => r.status === 'rejected' && r.profile_id).length})
                    </button>
                    <button
                        onClick={() => setActiveTab('coupons')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'coupons' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Coupons ({referrals.filter(r => !r.profile_id).length})
                    </button>
                </div>

                <button
                    onClick={() => { setEditingReferral({}); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors text-sm font-bold uppercase tracking-wider h-fit"
                >
                    <FiPlus /> Add New Code
                </button>
            </div>

            <div className="bg-[#0b132b] rounded-xl shadow-lg border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300">
                        <thead className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-6 py-4 font-black">Code</th>
                                <th className="px-6 py-4 font-black">
                                    {activeTab === 'coupons' ? 'Label / Promo Name' : 'User / College'}
                                </th>
                                <th className="px-6 py-4 font-black">Referrals</th>
                                <th className="px-6 py-4 font-black text-center">Status</th>
                                <th className="px-6 py-4 text-right font-black">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredReferrals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                        No entries found in this category.
                                    </td>
                                </tr>
                            ) : (
                                filteredReferrals.map((ref) => (
                                    <tr key={ref.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-black text-blue-400 text-lg uppercase tracking-wider">{ref.referral_code}</span>
                                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">
                                                    Joined {new Date(ref.created_at).toISOString().split('T')[0]}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {ref.profile_id ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                                        <FiUser size={14} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="text-sm text-white font-bold">{ref.profile?.full_name || 'Anonymous User'}</div>
                                                        <div className="text-[10px] text-gray-500 font-mono">
                                                            {ref.college || 'N/A'} • {ref.year_of_study || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="text-sm text-white font-bold">{ref.label || 'Generic Promo Code'}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-tighter">System Generated</div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 hidden sm:block"></span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-xl font-black text-white">{ref.referral_count || 0}</span>
                                                        {ref.usage_limit && (
                                                            <span className="text-xs text-gray-500 font-bold">/ {ref.usage_limit}</span>
                                                        )}
                                                    </div>
                                                    <span className="text-[9px] text-blue-400/80 font-bold uppercase hidden sm:block">
                                                        Total Usages
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 hidden sm:block"></span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-sm font-black text-gray-300">{ref.checked_in_count || 0}</span>
                                                    </div>
                                                    <span className="text-[9px] text-green-400/80 font-bold uppercase hidden sm:block">
                                                        Checked-In
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${ref.status === 'approved'
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                    : ref.status === 'pending'
                                                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>
                                                    {ref.status}
                                                </span>
                                                {ref.status === 'approved' && (
                                                    <span className={`text-[8px] font-bold uppercase tracking-tighter ${ref.is_active ? 'text-blue-400' : 'text-gray-600'}`}>
                                                        {ref.is_active ? 'Publicly Active' : 'Suspended'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {activeTab === 'applications' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(ref.id, { status: 'approved', is_active: true }, 'Ambassador approved!')}
                                                            className="p-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-all"
                                                            title="Approve"
                                                        >
                                                            <FiCheck />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(ref.id, { status: 'rejected' }, 'Application rejected.')}
                                                            className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all"
                                                            title="Reject"
                                                        >
                                                            <FiX />
                                                        </button>
                                                    </>
                                                )}
                                                {activeTab === 'rejected' && (
                                                    <button
                                                        onClick={() => handleAction(ref.id, { status: 'approved', is_active: true }, 'Ambassador re-approved!')}
                                                        className="p-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-all"
                                                        title="Re-approve"
                                                    >
                                                        <FiCheck />
                                                    </button>
                                                )}
                                                {(activeTab === 'ambassadors' || activeTab === 'coupons') && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(ref.id, { is_active: !ref.is_active }, `Code ${ref.is_active ? 'deactivated' : 'activated'}`)}
                                                            className={`p-2 rounded-lg transition-all border ${ref.is_active
                                                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20'
                                                                : 'bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20'
                                                                }`}
                                                            title={ref.is_active ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {ref.is_active ? <FiToggleRight /> : <FiToggleLeft />}
                                                        </button>
                                                        <button
                                                            onClick={() => { setEditingReferral(ref); setIsModalOpen(true); }}
                                                            className="p-2 bg-white/5 text-gray-400 border border-white/10 rounded-lg hover:text-white hover:bg-white/10 transition-all"
                                                            title="Edit"
                                                        >
                                                            <FiEdit2 />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(ref.id)}
                                                            className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all"
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#132247] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <FiX size={24} />
                        </button>

                        <form onSubmit={handleSave} className="p-8">
                            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-widest">
                                {editingReferral?.id ? 'Edit Code' : 'Create Generic Coupon'}
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Referral Code</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors uppercase font-bold"
                                        value={editingReferral?.referral_code || ''}
                                        onChange={e => setEditingReferral({ ...editingReferral, referral_code: e.target.value })}
                                        placeholder="E.G. SUMMIT20"
                                    />
                                </div>

                                {!editingReferral?.profile_id && (
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Internal Label</label>
                                        <input
                                            type="text"
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                                            value={editingReferral?.label || ''}
                                            onChange={e => setEditingReferral({ ...editingReferral, label: e.target.value })}
                                            placeholder="E.G. PARTNER_DISCOUNT"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Custom Discount % (Optional)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                                        value={editingReferral?.discount_override || ''}
                                        onChange={e => setEditingReferral({ ...editingReferral, discount_override: parseInt(e.target.value) || null })}
                                        placeholder="LEAVE EMPTY FOR GLOBAL DEFAULT"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Max Usage Limit (Optional)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                                        value={editingReferral?.usage_limit || ''}
                                        onChange={e => setEditingReferral({ ...editingReferral, usage_limit: parseInt(e.target.value) || null })}
                                        placeholder="LEAVE EMPTY FOR UNLIMITED"
                                        min="1"
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={editingReferral?.is_active ?? true}
                                        onChange={e => setEditingReferral({ ...editingReferral, is_active: e.target.checked })}
                                        className="w-4 h-4 rounded border-white/10 bg-black/30 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-bold text-gray-300">Active Immediately?</label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading === 'saving'}
                                className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all disabled:opacity-50"
                            >
                                {loading === 'saving' ? 'Saving...' : 'Save Code'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
