import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import PageLayout3DWrapper from '@/components/3d/PageLayout3DWrapper';

interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    category: string;
    location: string | null;
    image_url: string | null;
    registration_link: string | null;
    details_url: string | null;
    status: 'upcoming' | 'ongoing' | 'past';
    featured: boolean;
    is_esummit: boolean;
    registrations_open: boolean; // New field
}

async function getEvents(): Promise<{ events: Event[], error?: string }> {
    const supabase = await createServerClient();
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching events:', JSON.stringify(error, null, 2));
            return { events: [], error: error.message || 'Unknown error fetching events' };
        }

        return { events: (data as unknown as Event[]) || [] };
    } catch (err: any) {
        console.error('Unexpected error fetching events:', err);
        return { events: [], error: err.message || 'Unexpected error' };
    }
}

export default async function Events() {
    const { events: allEvents, error } = await getEvents();
    const upcomingEvents = allEvents.filter((e) => e.status === 'upcoming');
    const ongoingEvents = allEvents.filter((e) => e.status === 'ongoing');
    const pastEvents = allEvents.filter((e) => e.status === 'past');

    // Calculate approximate page height for ScrollControls
    // Base: 1.5 (Hero)
    // Per row of events: ~0.6 (assuming 3 cols on desktop)
    const totalRows = Math.ceil(upcomingEvents.length / 3) + Math.ceil(ongoingEvents.length / 3) + Math.ceil(pastEvents.length / 3);
    const calculatedPages = 2 + (totalRows * 0.6);
    const pages = Math.max(2.5, calculatedPages);

    // Mobile calculation (1 column)
    const totalRowsMobile = upcomingEvents.length + ongoingEvents.length + pastEvents.length;
    const calculatedPagesMobile = 2.5 + (totalRowsMobile * 0.65); // Slightly more per item for mobile
    const mobilePages = Math.max(3, calculatedPagesMobile);


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const EventCard = ({ event }: { event: Event }) => {
        const eventLink = event.details_url
            ? event.details_url
            : event.is_esummit
                ? `/esummit/events/${event.id}`
                : `/events/${event.id}`;

        const isExternalLink = event.details_url ? true : false;
        const isRegistrationOpen = event.registrations_open !== false; // Default to true if undefined

        return (
            <div className="group bg-zinc-900/80 backdrop-blur-md rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full border border-white/5 hover:border-primary-golden/30">
                <Link href={eventLink} {...(isExternalLink && { target: "_blank", rel: "noopener noreferrer" })}>
                    {event.image_url ? (
                        <div className="relative h-48 overflow-hidden">
                            <img
                                src={event.image_url}
                                alt={event.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            {event.featured && (
                                <span className="absolute top-4 right-4 bg-primary-golden text-white text-xs font-bold px-3 py-1 rounded-full uppercase z-10">
                                    Featured
                                </span>
                            )}
                            {event.is_esummit && (
                                <span className="absolute top-4 right-4 bg-[#56edf1] text-black text-xs font-bold px-3 py-1 rounded-full uppercase z-10" style={{ right: event.featured ? '5.5rem' : '1rem' }}>
                                    E-Summit
                                </span>
                            )}
                            {event.status === 'upcoming' && (
                                <span className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase animate-pulse">
                                    Upcoming
                                </span>
                            )}
                            {event.status === 'ongoing' && (
                                <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase animate-pulse">
                                    Live Now
                                </span>
                            )}
                            {!isRegistrationOpen && event.status === 'upcoming' && (
                                <span className="absolute bottom-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                                    Registration Closed
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="relative h-48 bg-gradient-to-br from-primary-green to-gray-800 flex items-center justify-center">
                            {event.featured && (
                                <span className="absolute top-4 right-4 bg-primary-golden text-white text-xs font-bold px-3 py-1 rounded-full uppercase z-10">
                                    Featured
                                </span>
                            )}
                            {event.is_esummit && (
                                <span className="absolute top-4 right-4 bg-[#56edf1] text-black text-xs font-bold px-3 py-1 rounded-full uppercase z-10" style={{ right: event.featured ? '5.5rem' : '1rem' }}>
                                    E-Summit
                                </span>
                            )}
                            {event.status === 'upcoming' && (
                                <span className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase animate-pulse">
                                    Upcoming
                                </span>
                            )}
                            {event.status === 'ongoing' && (
                                <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase animate-pulse">
                                    Live Now
                                </span>
                            )}
                            <div className="text-7xl">🎯</div>
                        </div>
                    )}
                </Link>
                <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-primary-golden font-semibold text-sm">
                            {formatDate(event.date)}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-white/10 text-gray-300 rounded-full border border-white/5">
                            {event.category}
                        </span>
                    </div>
                    <Link href={eventLink} {...(isExternalLink && { target: "_blank", rel: "noopener noreferrer" })}>
                        <h3 className="text-2xl font-heading text-white mb-3 group-hover:text-primary-golden transition-colors">
                            {event.title}
                        </h3>
                    </Link>
                    <p className="text-gray-400 leading-relaxed mb-4 line-clamp-3">{event.description}</p>
                    {event.location && (
                        <p className="text-sm text-gray-500 mb-4">📍 {event.location}</p>
                    )}
                    <div className="flex gap-3 mt-auto">
                        <Link
                            href={eventLink}
                            {...(isExternalLink && { target: "_blank", rel: "noopener noreferrer" })}
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-green text-white px-4 py-2 rounded-lg hover:shadow-lg hover:bg-green-700 transition-all text-sm font-semibold"
                        >
                            View Details
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>

                    </div>
                </div>
            </div>
        );
    };

    return (
        <PageLayout3DWrapper pages={pages} mobilePages={mobilePages}>
            <div className="w-full">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 flex flex-col justify-center items-center text-center pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/10 max-w-4xl pointer-events-auto shadow-2xl">
                        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl mb-6 text-white">Our Events</h1>
                        <p className="text-lg md:text-xl max-w-3xl mx-auto text-white/90">
                            Join us for exciting workshops, competitions, and networking opportunities
                        </p>
                    </div>
                </section>

                {/* Upcoming Events */}
                {upcomingEvents.length > 0 && (
                    <section className="section text-white pointer-events-none">
                        <div className="container-custom pointer-events-auto">
                            <div className="text-center mb-16 bg-black/60 backdrop-blur-md px-8 py-6 rounded-2xl inline-block mx-auto border border-white/5">
                                <h2 className="text-4xl md:text-5xl font-heading text-primary-green mb-4">
                                    Upcoming Events
                                </h2>
                                <div className="w-20 h-1 bg-gradient-to-r from-primary-golden to-yellow-700 mx-auto rounded-full" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                                {upcomingEvents.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Ongoing Events */}
                {ongoingEvents.length > 0 && (
                    <section className="section text-white pointer-events-none">
                        <div className="container-custom pointer-events-auto">
                            <div className="text-center mb-16 bg-black/60 backdrop-blur-md px-8 py-6 rounded-2xl inline-block mx-auto border border-white/5">
                                <h2 className="text-4xl md:text-5xl font-heading text-primary-green mb-4">
                                    Ongoing Events
                                </h2>
                                <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-orange-700 mx-auto rounded-full" />
                                <p className="text-gray-300 mt-4">Events happening right now!</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                                {ongoingEvents.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Past Events */}
                {pastEvents.length > 0 && (
                    <section className="section text-white pointer-events-none pb-40">
                        <div className="container-custom pointer-events-auto">
                            <div className="text-center mb-16 bg-black/60 backdrop-blur-md px-8 py-6 rounded-2xl inline-block mx-auto border border-white/5">
                                <h2 className="text-4xl md:text-5xl font-heading text-primary-green mb-4">
                                    Past Events
                                </h2>
                                <div className="w-20 h-1 bg-gradient-to-r from-primary-golden to-yellow-700 mx-auto rounded-full" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                                {pastEvents.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Error State */}
                {error && (
                    <section className="section">
                        <div className="container-custom text-center py-20 bg-black/60 backdrop-blur-md rounded-2xl border border-red-900/50">
                            <div className="text-7xl mb-4">⚠️</div>
                            <h3 className="text-2xl font-heading text-red-500 mb-2">Error Loading Events</h3>
                            <p className="text-gray-400 mb-4">{error}</p>
                            <p className="text-sm text-gray-500">Please try refreshing the page later.</p>
                        </div>
                    </section>
                )}

                {/* No Events State */}
                {!error && allEvents.length === 0 && (
                    <section className="section">
                        <div className="container-custom text-center py-20 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10">
                            <div className="text-7xl mb-4">📅</div>
                            <h3 className="text-2xl font-heading text-gray-400 mb-2">No Events Yet</h3>
                            <p className="text-gray-500">Check back soon for upcoming events!</p>
                        </div>
                    </section>
                )}
            </div>
        </PageLayout3DWrapper>
    );
}
