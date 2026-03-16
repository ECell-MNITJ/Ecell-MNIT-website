'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiSearch, FiCheckCircle, FiUser, FiCalendar, FiMapPin, FiLoader, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Event {
    id: string;
    title: string;
}

interface Attendee {
    id: string;
    registration_id: string;
    checked_in: boolean;
    profile: {
        full_name: string;
        email: string;
        phone: string;
    };
    team_name?: string;
}

export default function EventAttendanceCheckin({ events }: { events: Event[] }) {
    const supabase = createClient();
    const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
    const [ticketId, setTicketId] = useState('');
    const [loading, setLoading] = useState(false);
    const [attendee, setAttendee] = useState<Attendee | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!ticketId.trim() || !selectedEventId) return;

        setLoading(true);
        setError(null);
        setAttendee(null);

        try {
            const { data, error: searchError } = await supabase
                .from('event_registrations')
                .select(`
                    id,
                    registration_id,
                    checked_in,
                    user_id,
                    team_id,
                    teams(name),
                    profiles(full_name, email, phone)
                `)
                .eq('event_id', selectedEventId)
                .eq('registration_id', ticketId.trim().toUpperCase())
                .single();

            if (searchError) {
                if (searchError.code === 'PGRST116') {
                    setError('No registration found with this Ticket ID for the selected event.');
                } else {
                    throw searchError;
                }
                return;
            }

            const reg = data as any;
            setAttendee({
                id: reg.id,
                registration_id: reg.registration_id,
                checked_in: reg.checked_in,
                profile: {
                    full_name: reg.profiles?.full_name || 'N/A',
                    email: reg.profiles?.email || 'N/A',
                    phone: reg.profiles?.phone || 'N/A'
                },
                team_name: reg.teams?.name
            });
        } catch (err: any) {
            console.error('Search error:', err);
            setError('An error occurred while searching. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!attendee) return;

        setLoading(true);
        try {
            const { error: updateError } = await supabase
                .from('event_registrations')
                .update({
                    checked_in: true,
                    checked_in_at: new Date().toISOString()
                })
                .eq('id', attendee.id);

            if (updateError) throw updateError;

            setAttendee({ ...attendee, checked_in: true });
            toast.success(`${attendee.profile.full_name} checked in successfully!`);
        } catch (err: any) {
            console.error('Check-in error:', err);
            toast.error('Failed to mark attendance.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Search Form */}
            <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800 backdrop-blur-md shadow-xl">
                <form onSubmit={handleSearch} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
                                Select Event
                            </label>
                            <select
                                value={selectedEventId}
                                onChange={(e) => setSelectedEventId(e.target.value)}
                                className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none"
                            >
                                {events.map((event) => (
                                    <option key={event.id} value={event.id}>
                                        {event.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
                                Ticket ID / Code
                            </label>
                            <input
                                type="text"
                                value={ticketId}
                                onChange={(e) => setTicketId(e.target.value.toUpperCase())}
                                placeholder="e.g. ES-A1B2C3"
                                className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none uppercase tracking-widest font-mono"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? (
                            <FiLoader className="w-5 h-5 animate-spin" />
                        ) : (
                            <FiSearch className="w-5 h-5" />
                        )}
                        {loading ? 'Searching...' : 'Search Registration'}
                    </button>
                </form>

                {error && (
                    <div className="mt-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 animate-in fade-in slide-in-from-top-2">
                        <FiAlertCircle className="shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}
            </div>

            {/* Attendee Details Card */}
            {attendee && (
                <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="flex flex-col md:flex-row md:items-center gap-8">
                        {/* Avatar/Icon */}
                        <div className="shrink-0 w-24 h-24 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                            <FiUser className="w-12 h-12 text-gray-400" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-3xl font-black text-white">{attendee.profile.full_name}</h2>
                                {attendee.checked_in && (
                                    <span className="bg-green-500/10 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                        <FiCheckCircle className="w-3 h-3" />
                                        Checked In
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Email Address</p>
                                    <p className="text-gray-300 font-medium">{attendee.profile.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Phone Number</p>
                                    <p className="text-gray-300 font-medium">{attendee.profile.phone}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Ticket ID</p>
                                    <p className="text-purple-400 font-bold font-mono">{attendee.registration_id}</p>
                                </div>
                                {attendee.team_name && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Team</p>
                                        <p className="text-blue-400 font-bold">{attendee.team_name}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-800 flex justify-end gap-4">
                        {!attendee.checked_in ? (
                            <button
                                onClick={handleCheckIn}
                                disabled={loading}
                                className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-white font-black px-8 py-4 rounded-xl transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? (
                                    <FiLoader className="w-5 h-5 animate-spin" />
                                ) : (
                                    <FiCheckCircle className="w-5 h-5" />
                                )}
                                Mark as Checked-In
                            </button>
                        ) : (
                            <div className="w-full py-4 text-center bg-gray-800/50 rounded-xl text-gray-500 font-bold uppercase tracking-widest border border-gray-700">
                                Already Checked-In
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
