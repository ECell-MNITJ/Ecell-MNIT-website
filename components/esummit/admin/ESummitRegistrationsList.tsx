'use client';

import { useState, useTransition } from 'react';
import { FiChevronDown, FiChevronUp, FiUsers, FiCheckCircle, FiXCircle, FiUser, FiDownload, FiLoader } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { updateAttendanceStatus } from '@/app/actions/registrations';
import toast from 'react-hot-toast';

interface Registration {
    id: string;
    created_at: string;
    user_id: string;
    event_id: string;
    checked_in: boolean;
    team_id: string | null;
    profile?: {
        full_name: string | null;
        email: string | null;
    };
    teams?: {
        name: string;
    };
}

interface Event {
    id: string;
    title: string;
    is_team_event?: boolean;
}

interface GroupedRegistrations {
    [eventId: string]: {
        event: Event;
        registrations: Registration[];
    };
}

export default function ESummitRegistrationsList({
    groupedRegistrations
}: {
    groupedRegistrations: GroupedRegistrations
}) {
    const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
    const [isPending, startTransition] = useTransition();
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const toggleEvent = (eventId: string) => {
        const newExpanded = new Set(expandedEvents);
        if (newExpanded.has(eventId)) {
            newExpanded.delete(eventId);
        } else {
            newExpanded.add(eventId);
        }
        setExpandedEvents(newExpanded);
    };

    const handleToggleAttendance = (regId: string, currentStatus: boolean) => {
        setTogglingId(regId);
        startTransition(async () => {
            const result = await updateAttendanceStatus(regId, currentStatus);
            if (result.success) {
                toast.success('Attendance updated!');
            } else {
                toast.error('Failed to update: ' + result.error);
            }
            setTogglingId(null);
        });
    };

    // Helper to group registrations within an event by team
    const groupByTeam = (registrations: Registration[]) => {
        const teamsMap: { [teamId: string]: { name: string; members: Registration[] } } = {};
        const individuals: Registration[] = [];

        registrations.forEach(reg => {
            if (reg.team_id) {
                if (!teamsMap[reg.team_id]) {
                    teamsMap[reg.team_id] = {
                        name: reg.teams?.name || `Team ${reg.team_id.slice(0, 6)}`,
                        members: []
                    };
                }
                teamsMap[reg.team_id].members.push(reg);
            } else {
                individuals.push(reg);
            }
        });

        return {
            teams: Object.entries(teamsMap).map(([id, data]) => ({ id, ...data })),
            individuals
        };
    };

    // ... (rest of handleExportExcel same)
    const handleExportExcel = (eventId: string) => {
        // ... previous implementation
        const item = groupedRegistrations[eventId];
        if (!item || item.registrations.length === 0) return;

        const { teams, individuals } = groupByTeam(item.registrations);
        const exportData: any[] = [];

        // Add Teams
        teams.forEach((team) => {
            exportData.push({
                'Event': item.event.title,
                'Name': `TEAM: ${team.name}`,
                'Email': '',
                'Team Name': team.name,
                'Status': '',
                'Registration Date': ''
            });

            team.members.forEach((reg) => {
                exportData.push({
                    'Event': item.event.title,
                    'Name': reg.profile?.full_name || reg.user_id,
                    'Email': reg.profile?.email || '-',
                    'Team Name': team.name,
                    'Status': reg.checked_in ? 'Checked In' : 'Pending',
                    'Registration Date': new Date(reg.created_at).toLocaleString()
                });
            });

            exportData.push({});
        });

        if (individuals.length > 0) {
            exportData.push({
                'Event': item.event.title,
                'Name': 'INDIVIDUAL REGISTRATIONS',
                'Email': '',
                'Team Name': '-',
                'Status': '',
                'Registration Date': ''
            });

            individuals.forEach((reg) => {
                exportData.push({
                    'Event': item.event.title,
                    'Name': reg.profile?.full_name || reg.user_id,
                    'Email': reg.profile?.email || '-',
                    'Team Name': 'Individual',
                    'Status': reg.checked_in ? 'Checked In' : 'Pending',
                    'Registration Date': new Date(reg.created_at).toLocaleString()
                });
            });
        }

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

        const fileName = `${item.event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_registrations.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const eventIds = Object.keys(groupedRegistrations);

    if (eventIds.length === 0) {
        return (
            <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
                <FiUsers className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No registrations found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {eventIds.map((eventId) => {
                const item = groupedRegistrations[eventId];
                const isExpanded = expandedEvents.has(eventId);
                const regCount = item.registrations.length;
                const { teams, individuals } = groupByTeam(item.registrations);

                return (
                    <div
                        key={eventId}
                        className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-lg transition-all hover:border-purple-500/30"
                    >
                        {/* Event Header */}
                        <div
                            className="p-6 cursor-pointer hover:bg-gray-800/50 transition-colors flex justify-between items-center select-none"
                            onClick={() => toggleEvent(eventId)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-purple-900/30 p-3 rounded-xl border border-purple-500/20 text-purple-400">
                                    <FiUsers className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                                        {item.event.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1">
                                            <span className="font-bold text-gray-300">{regCount}</span>
                                            {regCount === 1 ? 'Registration' : 'Registrations'}
                                        </span>
                                        {item.event.is_team_event && (
                                            <span className="bg-blue-900/40 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-500/30 uppercase font-black">
                                                Team Event
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {regCount > 0 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleExportExcel(eventId);
                                        }}
                                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg border border-gray-700 transition-all text-sm font-medium"
                                        title="Export to Excel"
                                    >
                                        <FiDownload className="w-4 h-4" />
                                        <span className="hidden sm:inline">Export</span>
                                    </button>
                                )}
                                <div className="p-1">
                                    {isExpanded ? (
                                        <FiChevronUp className="w-6 h-6 text-gray-400" />
                                    ) : (
                                        <FiChevronDown className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Registrations List */}
                        {isExpanded && (
                            <div className="border-t border-gray-800">
                                {regCount === 0 ? (
                                    <div className="px-6 py-12 text-center text-gray-500 italic">
                                        No users registered for this event yet.
                                    </div>
                                ) : (
                                    <div className="p-4 space-y-8">
                                        {/* Teams Section */}
                                        {teams.length > 0 && (
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest pl-2">Teams ({teams.length})</h4>
                                                <div className="grid gap-4">
                                                    {teams.map((team) => (
                                                        <div key={team.id} className="bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden">
                                                            <div className="bg-gray-800/60 px-4 py-3 border-b border-gray-700/50 flex justify-between items-center">
                                                                <h5 className="font-bold text-purple-400 flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                                                    {team.name}
                                                                </h5>
                                                                <span className="text-[10px] text-gray-500 font-mono">{team.id.slice(0, 8)}</span>
                                                            </div>
                                                            <RegistrationTable
                                                                registrations={team.members}
                                                                onToggleAttendance={handleToggleAttendance}
                                                                togglingId={togglingId}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Individuals Section */}
                                        {individuals.length > 0 && (
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest pl-2">
                                                    {item.event.is_team_event ? `Individuals / Incomplete Teams (${individuals.length})` : `Registrations (${individuals.length})`}
                                                </h4>
                                                <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden">
                                                    <RegistrationTable
                                                        registrations={individuals}
                                                        onToggleAttendance={handleToggleAttendance}
                                                        togglingId={togglingId}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function RegistrationTable({
    registrations,
    onToggleAttendance,
    togglingId,
}: {
    registrations: Registration[];
    onToggleAttendance: (regId: string, currentStatus: boolean) => void;
    togglingId: string | null;
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-800/30 text-gray-400 text-[10px] uppercase tracking-widest font-bold border-b border-gray-800/50">
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3 text-center">Attendance</th>
                        <th className="px-6 py-3 text-right">Registered At</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                    {registrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 border border-gray-600">
                                        <FiUser className="w-4 h-4" />
                                    </div>
                                    <div className="font-medium text-white text-sm">
                                        {reg.profile?.full_name || reg.user_id}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-400 text-xs">
                                {reg.profile?.email || '-'}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => onToggleAttendance(reg.id, reg.checked_in)}
                                        disabled={togglingId === reg.id}
                                        className="relative group transition-all"
                                    >
                                        {reg.checked_in ? (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-black uppercase tracking-wider group-hover:bg-green-500/20 transition-colors">
                                                {togglingId === reg.id ? <FiLoader className="w-3 h-3 animate-spin" /> : <FiCheckCircle className="w-3 h-3" />}
                                                Checked In
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500/80 border border-yellow-500/20 text-[9px] font-black uppercase tracking-wider group-hover:bg-yellow-500/20 transition-colors">
                                                {togglingId === reg.id ? <FiLoader className="w-3 h-3 animate-spin" /> : <FiXCircle className="w-3 h-3" />}
                                                Pending
                                            </div>
                                        )}
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-gray-700">
                                            Click to toggle attendance
                                        </div>
                                    </button>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 text-right text-[10px] whitespace-nowrap">
                                {new Date(reg.created_at).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
