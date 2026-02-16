import { createServerClient } from '@/lib/supabase/server';
import { FiCalendar, FiUsers, FiAward } from 'react-icons/fi';
import Link from 'next/link';

async function getStats() {
    const supabase = await createServerClient();

    // Get events count
    const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('is_esummit', true);

    // Get registrations count for E-Summit events
    // This is a bit complex with a join, but for simple count we can fetch all registrations for now or use a view
    // A simpler way for now: Get all E-Summit events IDs first?
    // Or just count all registrations where event_id is in (select id from events where is_esummit = true)

    // Let's just do a simple query.
    const { data: esummitEvents } = await supabase
        .from('events')
        .select('id')
        .eq('is_esummit', true);

    const eventIds = esummitEvents?.map(e => e.id) || [];

    let registrationsCount = 0;
    if (eventIds.length > 0) {
        const { count } = await supabase
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .in('event_id', eventIds);
        registrationsCount = count || 0;
    }

    return {
        events: eventsCount || 0,
        registrations: registrationsCount,
    };
}

export default async function ESummitAdminDashboard() {
    const stats = await getStats();

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center p-6">
                    <div className="p-4 rounded-full bg-purple-100 text-purple-600 mr-4">
                        <FiCalendar className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Events</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.events}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center p-6">
                    <div className="p-4 rounded-full bg-blue-100 text-blue-600 mr-4">
                        <FiUsers className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Registrations</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.registrations}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="flex justify-center gap-4">
                    <Link href="/esummit/admin/events/new" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-500 transition-colors">
                        Add New Event
                    </Link>
                    <Link href="/esummit/admin/registrations" className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                        View Registrations
                    </Link>
                </div>
            </div>
        </div>
    );
}
