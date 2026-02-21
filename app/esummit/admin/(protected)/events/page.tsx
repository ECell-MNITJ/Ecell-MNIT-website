import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';
import ESummitEventList from '@/components/esummit/admin/ESummitEventList';

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
                <h1 className="text-3xl font-bold text-white">E-Summit Events</h1>
                <Link
                    href="/esummit/admin/events/new"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors flex items-center gap-2"
                >
                    <FiPlus /> Add Event
                </Link>
            </div>

            <ESummitEventList initialEvents={events || []} />
        </div>
    );
}
