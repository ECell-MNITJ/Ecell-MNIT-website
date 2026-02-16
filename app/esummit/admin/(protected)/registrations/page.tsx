import { createServerClient } from '@/lib/supabase/server';

export default async function ESummitRegistrationsPage() {
    const supabase = await createServerClient();

    // Fetch registrations for E-Summit events
    // We join with events table and filter by is_esummit
    const { data: registrations, error } = await supabase
        .from('event_registrations')
        .select(`
            *,
            events!inner(*),
            profiles(*)
        `)
        .eq('events.is_esummit', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching registrations:', error);
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">E-Summit Registrations</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600">Event</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">User</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Email</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Team ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {!registrations || registrations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No registrations found.
                                    </td>
                                </tr>
                            ) : (
                                registrations.map((reg: any) => (
                                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {reg.events?.title || 'Unknown Event'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {reg.profiles?.full_name || reg.user_id}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {reg.profiles?.email || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(reg.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${reg.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                reg.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {reg.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                            {reg.team_id || '-'}
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
