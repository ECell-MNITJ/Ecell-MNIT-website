import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';

async function getEvents() {
    const supabase = await createServerClient();
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_esummit', true)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching events:', error);
        return [];
    }
    return data;
}

export default async function ESummitAdminEventsPage() {
    const events = await getEvents();

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">E-Summit Events</h1>
                <Link
                    href="/esummit/admin/events/new"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors flex items-center gap-2"
                >
                    <FiPlus /> Add Event
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600">Title</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Category</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {events.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No events found. Create one to get started!
                                    </td>
                                </tr>
                            ) : (
                                events.map((event) => (
                                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{event.title}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(event.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{event.category}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${event.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                                                    event.status === 'ongoing' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {event.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/esummit/events/${event.id}`}
                                                    target="_blank"
                                                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                    title="View"
                                                >
                                                    <FiEye />
                                                </Link>
                                                <Link
                                                    href={`/esummit/admin/events/${event.id}/edit`}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 />
                                                </Link>
                                                {/* Delete functionality would go here, usually strictly guarded */}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
