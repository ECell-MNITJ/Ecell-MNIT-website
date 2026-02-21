import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';

interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    category: string;
    location: string | null;
    image_url: string | null;
    status: 'upcoming' | 'ongoing' | 'past';
    featured: boolean;
    is_esummit: boolean;
    registrations_open: boolean;
}

async function getEsummitEvents(): Promise<Event[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
        .from('events')
        .select('id, title, description, date, category, location, image_url, status, featured, is_esummit, registrations_open')
        .eq('is_esummit', true)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching E-Summit events:', JSON.stringify(error, null, 2));
        return [];
    }

    return (data as unknown as Event[]) || [];
}

export default async function ESummitEventsPage() {
    const events = await getEsummitEvents();
    const upcomingEvents = events.filter((e) => e.status === 'upcoming');
    const pastEvents = events.filter((e) => e.status === 'past');
    const ongoingEvents = events.filter((e) => e.status === 'ongoing');

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const EventCard = ({ event }: { event: Event }) => (
        <div className="group relative bg-esummit-card/80 backdrop-blur-md rounded-2xl overflow-hidden border border-esummit-primary/20 hover:border-esummit-primary/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(157,78,221,0.2)]">
            <Link href={`/esummit/events/${event.id}`}>
                {event.image_url ? (
                    <div className="relative h-60 overflow-hidden">
                        <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-esummit-card via-transparent to-transparent opacity-80" />

                        {/* Status Badge */}
                        <div className="absolute top-4 left-4">
                            {event.status === 'upcoming' && (
                                <span className="bg-esummit-primary/90 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm shadow-[0_0_10px_rgba(157,78,221,0.4)] animate-pulse">
                                    Upcoming
                                </span>
                            )}
                            {event.status === 'ongoing' && (
                                <span className="bg-esummit-accent/90 text-esummit-bg text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm shadow-[0_0_10px_rgba(0,240,255,0.4)] animate-pulse">
                                    Live Now
                                </span>
                            )}
                            {event.status === 'past' && (
                                <span className="bg-gray-800/90 text-gray-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm border border-gray-700">
                                    Completed
                                </span>
                            )}
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                            <span className="bg-black/50 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm transition-all hover:bg-black/70">
                                {event.category}
                            </span>
                            {!event.registrations_open && event.status === 'upcoming' && (
                                <span className="bg-red-900/80 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter border border-red-500/30 backdrop-blur-sm shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                                    Registration Closed
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="relative h-60 bg-gradient-to-br from-esummit-card to-black flex items-center justify-center border-b border-esummit-primary/10">
                        <div className="text-6xl grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">HUB</div>
                    </div>
                )}
            </Link>

            <div className="p-6 relative">
                {/* Glow Effect */}
                <div className="absolute -top-10 left-0 w-full h-10 bg-gradient-to-t from-esummit-card to-transparent" />

                <div className="flex items-center gap-2 mb-4 text-xs font-medium text-esummit-primary tracking-wider uppercase">
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-esummit-primary" />
                        {formatDate(event.date)}
                    </span>
                </div>

                <Link href={`/esummit/events/${event.id}`}>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-esummit-accent transition-colors">
                        {event.title}
                    </h3>
                </Link>

                <p className="text-gray-400 leading-relaxed line-clamp-2 mb-6 text-sm">{event.description}</p>

                <Link
                    href={`/esummit/events/${event.id}`}
                    className="inline-flex items-center justify-center w-full bg-white/5 hover:bg-esummit-primary text-white text-sm font-bold uppercase tracking-widest px-6 py-3 rounded-lg border border-white/10 hover:border-esummit-primary transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(157,78,221,0.4)]"
                >
                    View Details
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen text-white selection:bg-esummit-primary selection:text-white">
            {/* Header */}
            <section className="relative py-32 overflow-hidden">
                {/* Background Removed as requested */}

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase pb-2">
                        <span className="text-white">E-Summit</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-esummit-primary to-esummit-accent pr-2 relative">Events</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Discover the lineups, competitions, and workshops at E-Summit.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 pb-24">
                {events.length === 0 ? (
                    <div className="text-center py-20 bg-esummit-card/30 rounded-3xl border border-white/5">
                        <div className="text-6xl mb-4">👾</div>
                        <h2 className="text-3xl font-bold text-gray-400 mb-4">No events found</h2>
                        <p className="text-gray-500">Check back later for updates.</p>
                    </div>
                ) : (
                    <div className="space-y-20">
                        {ongoingEvents.length > 0 && (
                            <div className="relative">
                                <div className="flex items-center gap-4 mb-10">
                                    <h2 className="text-3xl font-bold text-white tracking-wide">Happening Now</h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-esummit-accent/50 to-transparent" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                                    {ongoingEvents.map(event => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {upcomingEvents.length > 0 && (
                            <div className="relative">
                                <div className="flex items-center gap-4 mb-10">
                                    <h2 className="text-3xl font-bold text-white tracking-wide">Upcoming Events</h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-esummit-primary/50 to-transparent" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                                    {upcomingEvents.map(event => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {pastEvents.length > 0 && (
                            <div className="relative opacity-60 hover:opacity-100 transition-opacity duration-500">
                                <div className="flex items-center gap-4 mb-10">
                                    <h2 className="text-3xl font-bold text-gray-400 tracking-wide">Past Events</h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-gray-700 to-transparent" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                                    {pastEvents.map(event => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
