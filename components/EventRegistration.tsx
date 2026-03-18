'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiUsers, FiUserPlus, FiLogIn, FiCheck, FiCopy, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import TeamMembers from './TeamMembers';
import RegistrationDetailsModal from './esummit/RegistrationDetailsModal';
import { QRCodeCanvas } from 'qrcode.react';

interface EventRegistrationProps {
    event: {
        id: string;
        title: string;
        is_team_event: boolean;
        min_team_size: number;
        max_team_size: number;
        registration_link: string | null;
        is_esummit?: boolean;
    };
    user: any;
    hasValidPass?: boolean;
}

export default function EventRegistration({ event, user, hasValidPass }: EventRegistrationProps) {
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
            .select('phone, age, qr_code_url, user_type')
            .eq('id', user.id)
            .single() as any;

        if (!profile) return false;

        // Check for basic details and user type details
        const hasBasicDetails = profile.phone && profile.age && profile.qr_code_url;
        const hasUserTypeDetails = !!profile.user_type;

        return !!(hasBasicDetails && hasUserTypeDetails);
    }

    async function executeWithProfileCheck(action: () => void) {
        if (!user) {
            router.push(`/login?next=/events/${event.id}`);
            return;
        }

        // If it's an E-Summit event, they MUST have a valid pass
        if (event.is_esummit && !hasValidPass) {
            toast.error('You need an E-Summit Pass to register for this event.');
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

    // PRIORITY: If there is an external registration link, show it first
    // This allows users to register on external platforms without logging in
    if (event.registration_link) {
        return (
            <div className="bg-esummit-card/30 p-6 rounded-2xl border border-white/10 backdrop-blur-md text-center">
                <p className="text-gray-300 mb-6 font-medium text-sm">
                    This event requires registration on an external platform.
                </p>
                <a
                    href={event.registration_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-esummit-primary to-esummit-accent text-white py-4 rounded-xl font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-[1.02] transition-all duration-300 shadow-lg text-sm"
                >
                    Register Now
                </a>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="bg-esummit-card/30 p-6 rounded-2xl border border-white/10 backdrop-blur-md text-center">
                <p className="text-gray-300 mb-4 text-sm">Please login to register for this event.</p>
                <button
                    onClick={() => router.push(`/login?next=/events/${event.id}`)}
                    className="bg-esummit-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-esummit-accent transition-all text-sm"
                >
                    Login to Register
                </button>
            </div>
        );
    }

    if (event.is_esummit && !hasValidPass && !registration) {
        return (
            <div className="bg-red-500/10 p-6 rounded-xl border border-red-500/30 text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                    <FiInfo className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">E-Summit Pass Required</h3>
                <p className="text-gray-400 mb-6">You need an active E-Summit pass to register for this event.</p>
                <button
                    onClick={() => router.push('/esummit/passes')}
                    className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-500/25"
                >
                    Get Your Pass
                </button>
            </div>
        );
    }

    if (registration) {
        return (
            <div className="bg-green-500/10 p-4 md:p-6 rounded-xl border border-green-500/20">
                <div className="flex items-center gap-3 mb-4 text-green-400">
                    <div className="p-2 bg-green-500/20 rounded-full">
                        <FiCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base md:text-lg text-white">You are registered!</h3>
                        <p className="text-xs md:text-sm text-gray-400">
                            {event.is_team_event && team
                                ? `Team: ${team.name} (${registration.role})`
                                : 'Individual Registration'}
                        </p>
                    </div>
                </div>

                {registration.registration_id && (
                    <div className="bg-esummit-primary/10 p-4 rounded-lg border border-esummit-primary/20 mb-4">
                        <p className="text-[10px] text-esummit-primary uppercase font-bold mb-2 tracking-widest">Your Ticket ID</p>
                        <div className="flex items-center justify-between">
                            <span className="text-xl md:text-2xl font-black text-white tracking-widest font-mono">
                                {registration.registration_id}
                            </span>
                            <button 
                                onClick={async () => {
                                    await navigator.clipboard.writeText(registration.registration_id);
                                    toast.success('Ticket ID copied!');
                                }}
                                className="p-2 hover:bg-white/5 rounded text-gray-400 hover:text-esummit-primary transition-colors"
                                title="Copy Ticket ID"
                            >
                                <FiCopy />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2">
                            Show this ID at the event venue for check-in.
                        </p>
                    </div>
                )}

                {registration.registration_id && (
                    <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center gap-4 mb-4 shadow-inner">
                        <QRCodeCanvas
                            value={registration.registration_id}
                            size={160}
                            level="H"
                            includeMargin={true}
                            className="rounded-lg"
                        />
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Scan for Event Entry</p>
                    </div>
                )}

                {event.is_team_event && team && (
                    <div className="bg-black/20 p-4 rounded-lg border border-white/10 mt-4">
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Team Join Code</p>
                        <div className="flex items-center gap-2">
                            <code className="bg-esummit-bg px-3 py-2 rounded text-base md:text-lg font-mono font-bold tracking-wider text-white">
                                {team.join_code}
                            </code>
                            <button onClick={copyCode} className="p-2 hover:bg-white/5 rounded text-gray-400 hover:text-esummit-primary">
                                <FiCopy />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
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
                <div className="bg-esummit-card/30 p-4 md:p-6 rounded-xl border border-white/10 backdrop-blur-md">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2">Register for Event</h3>
                    <p className="text-gray-400 mb-6 text-sm">
                        Click the button below to confirm your registration.
                    </p>
                    <button
                        onClick={() => executeWithProfileCheck(handleDetailedRegistration)}
                        disabled={loading}
                        className="w-full bg-esummit-primary text-white py-3 rounded-lg font-bold hover:bg-esummit-accent transition-colors disabled:opacity-50 text-sm md:text-base"
                    >
                        {loading ? 'Registering...' : 'Register Now'}
                    </button>
                </div>
            ) : (
                <div className="bg-esummit-card/30 rounded-xl border border-white/10 backdrop-blur-md overflow-hidden">
                    <div className="flex border-b border-white/10">
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`flex-1 py-3 md:py-4 text-center text-xs md:text-sm font-medium transition-colors ${activeTab === 'create'
                                ? 'bg-white/5 text-esummit-primary border-b-2 border-esummit-primary'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="flex items-center justify-center gap-1">
                                <FiUserPlus /> Create Team
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('join')}
                            className={`flex-1 py-3 md:py-4 text-center text-xs md:text-sm font-medium transition-colors ${activeTab === 'join'
                                ? 'bg-white/5 text-esummit-primary border-b-2 border-esummit-primary'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="flex items-center justify-center gap-1">
                                <FiLogIn /> Join Team
                            </span>
                        </button>
                    </div>

                    <div className="p-4 md:p-6">
                        {activeTab === 'create' ? (
                            <form onSubmit={(e) => { e.preventDefault(); executeWithProfileCheck(() => handleCreateTeam(e)); }}>
                                <div className="mb-4">
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Team Name</label>
                                    <input
                                        type="text"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        placeholder="Enter a cool team name"
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-esummit-primary focus:border-transparent outline-none text-white text-sm"
                                        required
                                    />
                                </div>
                                <div className="bg-esummit-primary/10 text-esummit-accent text-[10px] md:text-xs p-3 rounded-lg mb-4 flex gap-2">
                                    <FiInfo className="shrink-0 mt-0.5" />
                                    <p>You will be the team leader. A unique join code will be generated for you to share with teammates.</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-esummit-primary text-white py-3 rounded-lg font-bold hover:bg-esummit-accent transition-colors disabled:opacity-50 text-sm"
                                >
                                    {loading ? 'Creating Team...' : 'Create & Register'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={(e) => { e.preventDefault(); executeWithProfileCheck(() => handleJoinTeam(e)); }}>
                                <div className="mb-4">
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Join Code</label>
                                    <input
                                        type="text"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                        placeholder="Enter 6-digit code"
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-esummit-primary focus:border-transparent outline-none uppercase tracking-widest text-white text-sm"
                                        required
                                        maxLength={6}
                                    />
                                </div>
                                <div className="bg-esummit-primary/10 text-esummit-accent text-[10px] md:text-xs p-3 rounded-lg mb-4 flex gap-2">
                                    <FiInfo className="shrink-0 mt-0.5" />
                                    <p>Ask your team leader for the join code. Ensure the team isn't full before joining.</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-white/10 text-white py-3 rounded-lg font-bold hover:bg-white/20 transition-colors disabled:opacity-50 text-sm"
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
