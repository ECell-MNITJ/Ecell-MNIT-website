'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiUsers, FiUserPlus, FiLogIn, FiCheck, FiCopy, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import TeamMembers from './TeamMembers';
import RegistrationDetailsModal from './esummit/RegistrationDetailsModal';

interface EventRegistrationProps {
    event: {
        id: string;
        title: string;
        is_team_event: boolean;
        min_team_size: number;
        max_team_size: number;
        registration_link: string | null;
    };
    user: any;
}

export default function EventRegistration({ event, user }: EventRegistrationProps) {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [registration, setRegistration] = useState<any>(null);
    const [team, setTeam] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    // Form states
    const [teamName, setTeamName] = useState('');
    const [joinCode, setJoinCode] = useState('');

    useEffect(() => {
        if (user) {
            checkRegistration();
        }
    }, [user, event.id]);

    async function checkRegistration() {
        try {
            // Check if user is registered
            const { data: rawReg, error } = await supabase
                .from('event_registrations')
                .select('*, team:teams(*)')
                .eq('user_id', user.id)
                .eq('event_id', event.id)
                .single();

            const reg = rawReg as any;

            if (reg) {
                setRegistration(reg);
                if (reg.team) {
                    setTeam(reg.team);
                }
            }
        } catch (error) {
            console.error('Error checking registration:', error);
        }
    }

    async function checkProfileCompleteness() {
        if (!user) return false;

        const { data: profile } = await supabase
            .from('profiles')
            .select('phone, age, qr_code_url')
            .eq('id', user.id)
            .single();

        // Check if phone AND age are present (full_name is assumed from auth/initial creation)
        // Also check if QR code is generated
        if (!profile || !profile.phone || !profile.age || !profile.qr_code_url) {
            return false;
        }
        return true;
    }

    async function executeWithProfileCheck(action: () => void) {
        if (!user) {
            router.push(`/login?next=/events/${event.id}`);
            return;
        }

        const isComplete = await checkProfileCompleteness();
        if (isComplete) {
            action();
        } else {
            setPendingAction(() => action);
            setShowDetailsModal(true);
        }
    }

    async function generateJoinCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    async function handleDetailedRegistration() {
        if (!confirm(`Are you sure you want to register for ${event.title}?`)) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('event_registrations')
                .insert({
                    user_id: user.id,
                    event_id: event.id,
                    role: 'individual'
                });

            if (error) throw error;

            toast.success('Successfully registered!');
            checkRegistration();
        } catch (error: any) {
            toast.error(error.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateTeam(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (!teamName.trim()) return;

        setLoading(true);
        try {
            const code = await generateJoinCode();

            // 1. Create Team
            const { data: newTeam, error: teamError } = await supabase
                .from('teams')
                .insert({
                    event_id: event.id,
                    name: teamName,
                    join_code: code,
                    created_by: user.id
                })
                .select()
                .single();

            if (teamError) throw teamError;

            // 2. Register User as Leader
            const { error: regError } = await supabase
                .from('event_registrations')
                .insert({
                    user_id: user.id,
                    event_id: event.id,
                    team_id: newTeam.id,
                    role: 'leader'
                });

            if (regError) {
                // Rollback team creation if registration fails
                await supabase.from('teams').delete().eq('id', newTeam.id);
                throw regError;
            }

            toast.success('Team created and registered successfully!');
            checkRegistration();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to create team');
        } finally {
            setLoading(false);
        }
    }

    async function handleJoinTeam(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (!joinCode.trim()) return;

        setLoading(true);
        try {
            // 1. Find Team
            const { data: targetTeam, error: findError } = await supabase
                .from('teams')
                .select('*, event_registrations(count)')
                .eq('event_id', event.id)
                .eq('join_code', joinCode.toUpperCase())
                .single();

            if (findError || !targetTeam) {
                toast.error('Invalid team code');
                setLoading(false);
                return;
            }

            // 2. Check Capacity
            const currentMembers = targetTeam.event_registrations[0]?.count || 0;
            if (currentMembers >= event.max_team_size) {
                toast.error('Team is full!');
                setLoading(false);
                return;
            }

            // 3. Register User as Member
            const { error: regError } = await supabase
                .from('event_registrations')
                .insert({
                    user_id: user.id,
                    event_id: event.id,
                    team_id: targetTeam.id,
                    role: 'member'
                });

            if (regError) throw regError;

            toast.success('Joined team successfully!');
            checkRegistration();
        } catch (error: any) {
            if (error.code === '23505') {
                toast.error('You are already registered for this event');
            } else {
                toast.error(error.message || 'Failed to join team');
            }
        } finally {
            setLoading(false);
        }
    }

    async function copyCode() {
        if (team?.join_code) {
            await navigator.clipboard.writeText(team.join_code);
            toast.success('Team code copied!');
        }
    }

    if (!user) {
        return (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center">
                <p className="text-gray-600 mb-4">Please login to register for this event.</p>
                <button
                    onClick={() => router.push(`/login?next=/events/${event.id}`)}
                    className="bg-primary-golden text-white px-6 py-2 rounded-lg font-medium hover:bg-white hover:text-primary-golden transition-all"
                >
                    Login to Register
                </button>
            </div>
        );
    }

    if (registration) {
        return (
            <div className="bg-primary-green/5 p-6 rounded-xl border border-primary-green/20">
                <div className="flex items-center gap-3 mb-4 text-green-700">
                    <div className="p-2 bg-green-100 rounded-full">
                        <FiCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">You are registered!</h3>
                        <p className="text-sm opacity-80">
                            {event.is_team_event && team
                                ? `Team: ${team.name} (${registration.role})`
                                : 'Individual Registration'}
                        </p>
                    </div>
                </div>

                {event.is_team_event && team && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-2">Team Join Code</p>
                        <div className="flex items-center gap-2">
                            <code className="bg-gray-100 px-3 py-2 rounded text-lg font-mono font-bold tracking-wider">
                                {team.join_code}
                            </code>
                            <button onClick={copyCode} className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-primary-golden">
                                <FiCopy />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <FiInfo className="inline" /> Share this code with your teammates to let them join.
                        </p>
                    </div>
                )}

                {event.is_team_event && team && (
                    <TeamMembers teamId={team.id} currentUserId={user.id} />
                )}
            </div>
        );
    }

    return (
        <>
            <RegistrationDetailsModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                user={user}
                onComplete={() => {
                    setShowDetailsModal(false);
                    if (pendingAction) {
                        pendingAction();
                        setPendingAction(null);
                    }
                }}
            />

            {!event.is_team_event ? (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="text-xl font-heading text-primary-green mb-2">Register for Event</h3>
                    <p className="text-gray-600 mb-6">Click the button below to confirm your registration.</p>
                    <button
                        onClick={() => executeWithProfileCheck(handleDetailedRegistration)}
                        disabled={loading}
                        className="w-full bg-primary-golden text-white py-3 rounded-lg font-bold hover:bg-yellow-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Registering...' : 'Register Now'}
                    </button>
                </div>
            ) : (
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'create'
                                ? 'bg-white text-primary-golden border-b-2 border-primary-golden'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <FiUserPlus /> Create Team
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('join')}
                            className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'join'
                                ? 'bg-white text-primary-golden border-b-2 border-primary-golden'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <FiLogIn /> Join Team
                            </span>
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === 'create' ? (
                            <form onSubmit={(e) => { e.preventDefault(); executeWithProfileCheck(() => handleCreateTeam(e)); }}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                                    <input
                                        type="text"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        placeholder="Enter a cool team name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent outline-none"
                                        required
                                    />
                                </div>
                                <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-lg mb-4 flex gap-2">
                                    <FiInfo className="shrink-0 mt-0.5" />
                                    <p>You will be the team leader. A unique join code will be generated for you to share with teammates.</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary-golden text-white py-3 rounded-lg font-bold hover:bg-yellow-600 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Creating Team...' : 'Create & Register'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={(e) => { e.preventDefault(); executeWithProfileCheck(() => handleJoinTeam(e)); }}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Join Code</label>
                                    <input
                                        type="text"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                        placeholder="Enter 6-digit code"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent outline-none uppercase tracking-widest"
                                        required
                                        maxLength={6}
                                    />
                                </div>
                                <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-lg mb-4 flex gap-2">
                                    <FiInfo className="shrink-0 mt-0.5" />
                                    <p>Ask your team leader for the join code. Ensure the team isn't full before joining.</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary-green text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Joining...' : 'Join Team'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
