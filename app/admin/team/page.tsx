'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface TeamMember {
    id: string;
    name: string;
    role: string;

    image_url: string | null;
    order_index: number;
}

export default function TeamManagement() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .order('order_index', { ascending: true });

            if (error) throw error;
            setMembers(data || []);
        } catch (error: any) {
            toast.error('Failed to load team members');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this team member?')) return;

        try {
            const { error } = await supabase
                .from('team_members')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Team member deleted');
            fetchMembers();
        } catch (error: any) {
            toast.error('Failed to delete team member');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-heading text-primary-green mb-2">
                        Team Members
                    </h1>
                    <p className="text-gray-600">Manage your E-Cell team</p>
                </div>
                <Link
                    href="/admin/team/new"
                    className="flex items-center gap-2 bg-gradient-to-r from-primary-golden to-yellow-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
                >
                    <FiPlus className="w-5 h-5" />
                    Add Member
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-golden border-t-transparent"></div>
                </div>
            ) : members.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-lg">
                    <p className="text-gray-600 mb-4">No team members yet</p>
                    <Link
                        href="/admin/team/new"
                        className="inline-flex items-center gap-2 text-primary-golden hover:underline"
                    >
                        <FiPlus className="w-4 h-4" />
                        Add your first member
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                {member.image_url ? (
                                    <img
                                        src={member.image_url}
                                        alt={member.name}
                                        className="w-20 h-20 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-primary-golden/20 flex items-center justify-center">
                                        <span className="text-2xl font-heading text-primary-golden">
                                            {member.name.charAt(0)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/team/${member.id}`}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <FiEdit2 className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(member.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-heading text-primary-green mb-1">
                                {member.name}
                            </h3>
                            <p className="text-primary-golden text-sm font-medium mb-1">
                                {member.role}
                            </p>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
