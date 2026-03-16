import { createServerClient } from '@/lib/supabase/server';
import EventAttendanceCheckin from '@/components/esummit/admin/EventAttendanceCheckin';

export default async function EventAttendancePage() {
    const supabase = await createServerClient();

    // Fetch all E-Summit events for the dropdown
    const { data: events, error } = await supabase
        .from('events')
        .select('id, title')
        .eq('is_esummit', true)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching events:', error);
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                    Event <span className="text-purple-500">Attendance</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl">
                    Mark user attendance for specific E-Summit events by entering their unique Ticket ID.
                </p>
            </div>

            <EventAttendanceCheckin events={events || []} />
        </div>
    );
}
