'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiSearch, FiChevronDown, FiChevronUp, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function RegistrationsPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<any[]>([]);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
    const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            setLoading(true);

            // 1. Fetch Events
            const { data: eventsData, error: eventsError } = await supabase
                .from('events')
                .select('*')
                .order('date', { ascending: false });

            if (eventsError) throw eventsError;

            // 2. Fetch Registrations and Teams (teams are linked via FK)
            const { data: regsData, error: regsError } = await supabase
                .from('event_registrations')
                .select(`
                    *,
                    team:teams(name)
                `)
                .order('created_at', { ascending: false });

            if (regsError) throw regsError;

            // 3. Fetch Profiles manually (since no direct FK between event_registrations and profiles)
            let registrationsWithProfiles = [];
            if (regsData && regsData.length > 0) {
                const userIds = Array.from(new Set(regsData.map((r: any) => r.user_id)));

                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, phone')
                    .in('id', userIds);

                if (profilesError) throw profilesError;

                const profilesMap = new Map();
                profilesData?.forEach((p: any) => profilesMap.set(p.id, p));

                registrationsWithProfiles = regsData.map((r: any) => ({
                    ...r,
                    profile: profilesMap.get(r.user_id) || null
                }));
            }

            setEvents(eventsData || []);
            setRegistrations(registrationsWithProfiles);

            // expand the first event by default if exists
            if (eventsData && eventsData.length > 0) {
                setExpandedEvents(new Set([eventsData[0].id]));
            }

        } catch (error: any) {
            console.error('Error fetching data:', error);
            toast.error(error.message || 'Failed to load registrations');
        } finally {
            setLoading(false);
        }
    }

    const toggleEvent = (eventId: string) => {
        const newExpanded = new Set(expandedEvents);
        if (newExpanded.has(eventId)) {
            newExpanded.delete(eventId);
        } else {
            newExpanded.add(eventId);
        }
        setExpandedEvents(newExpanded);
    };

    const toggleTeam = (teamId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        const newExpanded = new Set(expandedTeams);
        if (newExpanded.has(teamId)) {
            newExpanded.delete(teamId);
        } else {
            newExpanded.add(teamId);
        }
        setExpandedTeams(newExpanded);
    };

    const getEventRegistrations = (eventId: string) => {
        return registrations.filter(r => r.event_id === eventId);
    };

    const groupRegistrations = (eventRegs: any[], isTeamEvent: boolean) => {
        if (!isTeamEvent) return { teams: [], individuals: eventRegs };

        const teamsMap = new Map();
        const individuals: any[] = [];

        eventRegs.forEach(reg => {
            if (reg.team_id && reg.team) {
                if (!teamsMap.has(reg.team_id)) {
                    teamsMap.set(reg.team_id, {
                        id: reg.team_id,
                        name: reg.team.name,
                        members: []
                    });
                }
                teamsMap.get(reg.team_id).members.push(reg);
            } else {
                individuals.push(reg);
            }
        });

        // Sort members within teams (Leader first)
        teamsMap.forEach(team => {
            team.members.sort((a: any, b: any) => {
                if (a.role === 'leader') return -1;
                if (b.role === 'leader') return 1;
                return 0;
            });
        });

        return {
            teams: Array.from(teamsMap.values()),
            individuals
        };
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderRegistrationTable = (regs: any[], showTeamColumn: boolean = false) => (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                    <tr>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Role</th>
                        {showTeamColumn && <th className="px-6 py-3">Team</th>}
                        <th className="px-6 py-3">Registered At</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {regs.map(reg => (
                        <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">
                                    {reg.profile?.full_name || 'Anonymous User'}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {reg.profile?.email}
                                </div>
                                {reg.profile?.phone && (
                                    <div className="text-xs text-gray-500">
                                        {reg.profile.phone}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs rounded font-medium ${reg.role === 'leader' ? 'bg-purple-100 text-purple-700' :
                                        reg.role === 'member' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                    {reg.role}
                                </span>
                            </td>
                            {showTeamColumn && (
                                <td className="px-6 py-4">
                                    {reg.team ? (
                                        <span className="font-medium text-gray-700">{reg.team.name}</span>
                                    ) : (
                                        <span className="text-gray-400 italic">No Team</span>
                                    )}
                                </td>
                            )}
                            <td className="px-6 py-4 text-sm text-gray-500">
                                {formatDate(reg.created_at)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    if (loading) {
        return <div className="p-8 text-center bg-gray-50 min-h-screen text-gray-500">Loading registrations...</div>;
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-heading text-gray-900">Event Registrations</h1>
                <div className="relative">
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-golden focus:border-transparent"
                    />
                </div>
            </div>

            <div className="space-y-6">
                {filteredEvents.map(event => {
                    const eventRegs = getEventRegistrations(event.id);
                    const isExpanded = expandedEvents.has(event.id);
                    const { teams, individuals } = groupRegistrations(eventRegs, event.is_team_event);
                    const totalRegistrations = eventRegs.length;

                    return (
                        <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div
                                onClick={() => toggleEvent(event.id)}
                                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center select-none"
                            >
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                        {event.title}
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${event.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                                                event.status === 'ongoing' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {event.status}
                                        </span>
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {new Date(event.date).toLocaleDateString()} • {totalRegistrations} Registrations
                                        {event.is_team_event && (
                                            <span className="ml-2 bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs">
                                                {teams.length} Teams
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <FiUsers />
                                        <span className="font-semibold">{totalRegistrations}</span>
                                    </div>
                                    {isExpanded ? <FiChevronUp className="w-5 h-5 text-gray-400" /> : <FiChevronDown className="w-5 h-5 text-gray-400" />}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="border-t border-gray-200">
                                    {totalRegistrations > 0 ? (
                                        <div className="p-4">
                                            {event.is_team_event && teams.length > 0 && (
                                                <div className="space-y-3 mb-6">
                                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Teams ({teams.length})</h4>
                                                    {teams.map((team: any) => {
                                                        const isTeamExpanded = expandedTeams.has(team.id);
                                                        return (
                                                            <div key={team.id} className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                                                                <div
                                                                    onClick={(e) => toggleTeam(team.id, e)}
                                                                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="font-bold text-gray-800">{team.name}</span>
                                                                        <span className="text-sm text-gray-500">({team.members.length} members)</span>
                                                                    </div>
                                                                    {isTeamExpanded ? <FiChevronUp className="w-4 h-4 text-gray-400" /> : <FiChevronDown className="w-4 h-4 text-gray-400" />}
                                                                </div>

                                                                {isTeamExpanded && (
                                                                    <div className="border-t border-gray-200 bg-white p-2">
                                                                        {renderRegistrationTable(team.members, false)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {(!event.is_team_event || individuals.length > 0) && (
                                                <div>
                                                    {event.is_team_event && individuals.length > 0 && (
                                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Individual Registrations</h4>
                                                    )}
                                                    {renderRegistrationTable(individuals, !event.is_team_event)}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-gray-500 italic">
                                            No registrations found for this event.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredEvents.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No events found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
