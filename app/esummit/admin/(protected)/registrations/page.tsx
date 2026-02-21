import { createServerClient } from '@/lib/supabase/server';
import ESummitRegistrationsList from '@/components/esummit/admin/ESummitRegistrationsList';

export default async function ESummitRegistrationsPage() {
    const supabase = await createServerClient();

    // 1. Fetch all E-Summit events first to ensure we have headers for events even without registrations
    const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, title, is_team_event')
        .eq('is_esummit', true)
        .order('date', { ascending: false });

    if (eventsError) {
        console.error('Error fetching E-Summit events:', eventsError);
    }

    // 2. Fetch registrations for E-Summit events
    const { data: registrations, error: regError } = await supabase
        .from('event_registrations')
        .select(`
            id,
            created_at,
            user_id,
            event_id,
            checked_in,
            team_id,
            teams(name),
            events!inner(title, is_esummit)
        `)
        .eq('events.is_esummit', true)
        .order('created_at', { ascending: false });

    if (regError) {
        console.error('Error fetching registrations:', regError);
    }

    // 3. Fetch profiles separately
    let registrationsWithProfiles: any[] = [];
    if (registrations && registrations.length > 0) {
        const userIds = Array.from(new Set(registrations.map(r => r.user_id)));
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds) as { data: any[] | null };

        const profilesMap = new Map((profiles || []).map(p => [p.id, p]));
        registrationsWithProfiles = registrations.map(reg => ({
            ...reg,
            profile: profilesMap.get(reg.user_id)
        }));
    }

    // 4. Group registrations by event
    const groupedRegistrations: any = {};

    // Initialize with all events
    events?.forEach(event => {
        groupedRegistrations[event.id] = {
            event: event,
            registrations: []
        };
    });

    // Populate with registrations
    registrationsWithProfiles.forEach(reg => {
        if (groupedRegistrations[reg.event_id]) {
            groupedRegistrations[reg.event_id].registrations.push(reg);
        } else {
            // Fallback for events that might have been filtered out of the initial list but exist in registrations
            groupedRegistrations[reg.event_id] = {
                event: { id: reg.event_id, title: reg.events?.title || 'Unknown Event' },
                registrations: [reg]
            };
        }
    });

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                    E-Summit <span className="text-purple-500">Registrations</span>
                </h1>
                <p className="text-gray-400">View and manage attendees grouped by event</p>
            </div>

            <ESummitRegistrationsList groupedRegistrations={groupedRegistrations} />
        </div>
    );
}
