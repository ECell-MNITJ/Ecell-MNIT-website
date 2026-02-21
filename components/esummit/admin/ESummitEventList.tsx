'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiEdit2, FiTrash2, FiEye, FiCheck, FiX } from 'react-icons/fi';
import { deleteESummitEvent, toggleRegistrationStatus } from '@/app/actions/esummit-events';
import toast from 'react-hot-toast';

interface Event {
    id: string;
    title: string;
    date: string;
    category: string;
    status: string;
    registrations_open: boolean;
}

interface Props {
    initialEvents: Event[];
}

export default function ESummitEventList({ initialEvents }: Props) {
    const [events, setEvents] = useState(initialEvents);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleDelete = async (eventId: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
            return;
        }

        setLoadingId(eventId);
        try {
            const result = await deleteESummitEvent(eventId);
            if (result.success) {
                setEvents(prev => prev.filter(e => e.id !== eventId));
                toast.success('Event deleted successfully');
            } else {
                toast.error(result.error || 'Failed to delete event');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoadingId(null);
        }
    };

    const handleToggleRegistration = async (eventId: string, currentStatus: boolean) => {
        setLoadingId(eventId);
        try {
            const result = await toggleRegistrationStatus(eventId, currentStatus);
            if (result.success) {
                setEvents(prev => prev.map(e =>
                    e.id === eventId ? { ...e, registrations_open: !currentStatus } : e
                ));
                toast.success('Registration status updated');
            } else {
                toast.error(result.error || 'Failed to update status');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-800 border-b border-gray-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-400">Title</th>
                            <th className="px-6 py-4 font-semibold text-gray-400">Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-400">Category</th>
                            <th className="px-6 py-4 font-semibold text-gray-400">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-400 text-center">Registrations</th>
                            <th className="px-6 py-4 font-semibold text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No events found. Create one to get started!
                                </td>
                            </tr>
                        ) : (
                            events.map((event) => (
                                <tr key={event.id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{event.title}</td>
                                    <td className="px-6 py-4 text-gray-400">
                                        {mounted ? new Date(event.date).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{event.category}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${event.status === 'upcoming' ? 'bg-green-900/30 text-green-400 border border-green-800' :
                                            event.status === 'ongoing' ? 'bg-orange-900/30 text-orange-400 border border-orange-800' :
                                                'bg-gray-800 text-gray-400 border border-gray-700'
                                            }`}>
                                            {event.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => handleToggleRegistration(event.id, event.registrations_open)}
                                                disabled={loadingId === event.id}
                                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${event.registrations_open
                                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                                                    : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                                    } disabled:opacity-50`}
                                            >
                                                {event.registrations_open ? (
                                                    <><FiCheck className="w-3 h-3" /> Open</>
                                                ) : (
                                                    <><FiX className="w-3 h-3" /> Closed</>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/esummit/events/${event.id}`}
                                                target="_blank"
                                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-gray-800 rounded-lg transition-colors"
                                                title="View"
                                            >
                                                <FiEye />
                                            </Link>
                                            <Link
                                                href={`/esummit/admin/events/${event.id}/edit`}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-800 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <FiEdit2 />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(event.id, event.title)}
                                                disabled={loadingId === event.id}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete"
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
