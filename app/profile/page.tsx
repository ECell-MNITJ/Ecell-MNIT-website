import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import UserProfile from '@/components/UserProfile';
import TeamMembers from '@/components/TeamMembers';

export default async function Profile() {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch registered events
    const { data: registrations, error } = await supabase
        .from('event_registrations')
        .select(`
            *,
            events (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching registrations:', error);
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="bg-gradient-to-br from-primary-green to-gray-900 text-white">
                <div className="container-custom py-16">
                    <UserProfile user={user} />
                </div>
            </div>

            <div className="container-custom py-12">
                <h2 className="text-2xl font-heading text-primary-green mb-6 border-b pb-4">
                    Registered Events
                </h2>

                {registrations && registrations.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {registrations.map((reg: any) => {
                            const event = reg.events;
                            if (!event) return null;

                            return (
                                <div key={reg.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all border border-gray-100">
                                    {event.image_url ? (
                                        <div className="h-40 bg-gray-200 relative">
                                            <img
                                                src={event.image_url}
                                                alt={event.title}
                                                className="w-full h-full object-cover"
                                            />
                                            {event.status === 'upcoming' && (
                                                <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                    Upcoming
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-40 bg-gradient-to-br from-primary-green to-gray-800 flex items-center justify-center text-4xl">
                                            🎯
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <p className="text-sm text-primary-golden font-semibold mb-1">
                                            {formatDate(event.date)}
                                        </p>
                                        <h3 className="text-xl font-heading text-primary-green mb-2 line-clamp-1">{event.title}</h3>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{event.description}</p>

                                        <div className="flex gap-2">
                                            <Link
                                                href={`/events/${event.id}`}
                                                className="flex-1 text-center bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                            >
                                                View Details
                                            </Link>
                                            {event.registration_link && (
                                                <Link
                                                    href={event.registration_link}
                                                    target="_blank"
                                                    className="flex-1 text-center bg-primary-golden text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                                                >
                                                    Zoom/Meet Link
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-xs text-gray-500 flex flex-col gap-2">
                                        <div className="flex justify-between items-center w-full">
                                            <span>Registered on {formatDate(reg.created_at)}</span>
                                            {reg.role && <span className="capitalize px-2 py-0.5 bg-gray-200 rounded text-gray-700 font-medium">{reg.role}</span>}
                                        </div>
                                        {event.is_team_event && reg.team_id && (
                                            <TeamMembers teamId={reg.team_id} currentUserId={user.id} />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="text-4xl mb-3">🎫</div>
                        <h3 className="text-xl font-heading text-gray-400 mb-2">No Registrations Yet</h3>
                        <p className="text-gray-500 mb-6">You haven't registered for any events yet.</p>
                        <Link href="/events" className="btn btn-primary text-sm">
                            Browse Events
                        </Link>
                    </div>
                )}

                <div className="mt-12 pt-6 border-t">
                    <form action="/auth/signout" method="post">
                        <button className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
