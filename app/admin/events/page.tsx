'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    category: string;
    status: 'upcoming' | 'ongoing' | 'past';
    featured: boolean;
    image_url: string | null;
}

export default function EventsManagement() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'past'>('all');
    const supabase = createClient();

    useEffect(() => {
        fetchEvents();
    }, [filter]);

    const fetchEvents = async () => {
        try {
            let query = supabase
                .from('events')
                .select('*')
                .order('date', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setEvents((data as any) || []);
        } catch (error: any) {
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Event deleted');
            fetchEvents();
        } catch (error: any) {
            toast.error('Failed to delete event');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-heading text-primary-green mb-2">Events</h1>
                    <p className="text-gray-600">Manage E-Cell events</p>
                </div>
                <Link
                    href="/admin/events/new"
                    className="flex items-center gap-2 bg-gradient-to-r from-primary-golden to-yellow-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
                >
                    <FiPlus className="w-5 h-5" />
                    Add Event
                </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {['all', 'upcoming', 'ongoing', 'past'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab as any)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === tab
                            ? 'bg-primary-golden text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-golden border-t-transparent"></div>
                </div>
            ) : events.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-lg">
                    <p className="text-gray-600 mb-4">No events yet</p>
                    <Link
                        href="/admin/events/new"
                        className="inline-flex items-center gap-2 text-primary-golden hover:underline"
                    >
                        <FiPlus className="w-4 h-4" />
                        Add your first event
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all flex gap-6"
                        >
                            {event.image_url ? (
                                <img
                                    src={event.image_url}
                                    alt={event.title}
                                    className="w-32 h-32 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <FiCalendar className="w-12 h-12 text-gray-400" />
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="text-xl font-heading text-primary-green mb-1">
                                            {event.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-gray-600">{formatDate(event.date)}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.status === 'upcoming'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {event.status}
                                            </span>
                                            {event.featured && (
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-golden/20 text-primary-golden">
                                                    Featured
                                                </span>
                                            )}
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                {event.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/admin/events/${event.id}`}
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(event.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-600 line-clamp-2">{event.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
