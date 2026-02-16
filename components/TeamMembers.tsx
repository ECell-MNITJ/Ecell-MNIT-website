'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiUser, FiGlobe, FiPhone } from 'react-icons/fi';

interface TeamMember {
    user_id: string;
    role: string;
    profile: {
        full_name: string | null;
        avatar_url: string | null;
        email?: string;
    } | null;
}

interface TeamMembersProps {
    teamId: string;
    currentUserId?: string;
}

export default function TeamMembers({ teamId, currentUserId }: TeamMembersProps) {
    const supabase = createClient();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (teamId) {
            fetchMembers();
        }
    }, [teamId]);

    async function fetchMembers() {
        try {
            setLoading(true);
            // 1. Get all registrations for this team
            const { data: registrations, error: regError } = await supabase
                .from('event_registrations')
                .select('user_id, role')
                .eq('team_id', teamId);

            if (regError) throw regError;

            if (!registrations || registrations.length === 0) {
                setMembers([]);
                return;
            }

            // 2. Fetch profiles for these users
            const userIds = registrations.map(r => r.user_id);
            const { data: profiles, error: profError } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', userIds);

            if (profError) throw profError;

            // 3. Combine data
            const combinedMembers = registrations.map(reg => {
                const profile = profiles?.find(p => p.id === reg.user_id) || null;
                return {
                    user_id: reg.user_id,
                    role: reg.role,
                    profile
                };
            });

            // Sort: Leader first, then others
            combinedMembers.sort((a, b) => {
                if (a.role === 'leader') return -1;
                if (b.role === 'leader') return 1;
                return 0;
            });

            // Filter out current user if currentUserId is provided
            const filteredMembers = currentUserId
                ? combinedMembers.filter(m => m.user_id !== currentUserId)
                : combinedMembers;

            setMembers(filteredMembers);
        } catch (error) {
            console.error('Error fetching team members:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="text-sm text-gray-500 animate-pulse">Loading team members...</div>;
    }

    if (members.length === 0) {
        return <div className="text-sm text-gray-500">No members found.</div>;
    }

    return (
        <div className="mt-4">
            <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Team Members</h4>
            <div className="space-y-3">
                {members.map((member) => (
                    <div key={member.user_id} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border border-gray-300 shrink-0">
                            {member.profile?.avatar_url ? (
                                <img
                                    src={member.profile.avatar_url}
                                    alt={member.profile.full_name || 'User'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-500 font-bold text-lg">
                                    {member.profile?.full_name?.charAt(0).toUpperCase() || <FiUser />}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {member.profile?.full_name || 'Anonymous User'}
                                {member.user_id === currentUserId && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">You</span>
                                )}
                            </p>
                            <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                                {member.role}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
