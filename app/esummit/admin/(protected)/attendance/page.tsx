'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface AttendanceRecord {
    id: string;
    checked_in_at: string;
    profiles: {
        full_name: string;
        email: string;
        phone: string;
    };
    events: {
        title: string;
    };
}

export default function AttendancePage() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('event_registrations')
                .select(`
                    id,
                    checked_in_at,
                    profiles (
                        full_name,
                        email,
                        phone
                    ),
                    events (
                        title
                    )
                `)
                .eq('checked_in', true)
                .order('checked_in_at', { ascending: false });

            if (error) throw error;

            setRecords(data as any || []);
        } catch (error: any) {
            console.error('Error fetching attendance:', error);
            toast.error('Failed to load attendance records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();

        // Real-time subscription
        const channel = supabase
            .channel('attendance_updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'event_registrations',
                    filter: 'checked_in=eq.true'
                },
                (payload) => {
                    console.log('Real-time update:', payload);
                    fetchAttendance(); // Refresh list on new check-in
                    toast.success('New check-in detected!');
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-heading text-primary-green mb-2">Live Attendance</h1>
                    <p className="text-gray-400">Real-time view of checked-in attendees</p>
                </div>
                <button
                    onClick={fetchAttendance}
                    className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                >
                    <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {records.length === 0 ? (
                <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
                    <div className="inline-block p-4 bg-gray-800 rounded-full mb-4">
                        <FiCheckCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">No Check-ins Yet</h3>
                    <p className="text-gray-400">Scan QR codes to mark attendance.</p>
                </div>
            ) : (
                <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-800 text-gray-400 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-medium border-b border-gray-700">Time</th>
                                    <th className="p-4 font-medium border-b border-gray-700">Attendee</th>
                                    <th className="p-4 font-medium border-b border-gray-700">Contact</th>
                                    <th className="p-4 font-medium border-b border-gray-700">Event</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {records.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4 text-gray-300 font-mono text-sm whitespace-nowrap">
                                            {new Date(record.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            <div className="text-xs text-gray-500">
                                                {new Date(record.checked_in_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-white">
                                                {(record.profiles as any)?.full_name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">
                                            <div>{(record.profiles as any)?.email}</div>
                                            <div className="text-xs">{(record.profiles as any)?.phone}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/50 text-purple-400 border border-purple-500/20">
                                                {(record.events as any)?.title}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
