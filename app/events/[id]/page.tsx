import { type EventDetails } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FiCalendar, FiMapPin, FiClock, FiShare2, FiMonitor, FiUser, FiInfo, FiArrowLeft, FiTag } from 'react-icons/fi';
import Image from 'next/image';
import EventRegistration from '@/components/EventRegistration';

interface Event {
    id: string;
    title: string;
    description: string;
    detailed_description?: string | null;
    date: string;
    category: string;
    location: string | null;
    image_url: string | null;

    details_url: string | null;
    status: 'upcoming' | 'ongoing' | 'past';
    featured: boolean;
    event_details: EventDetails | null;
    registrations_open: boolean;
}

async function getEvent(id: string): Promise<Event | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching event:', error);
        return null;
    }

    return data as unknown as Event;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const event = await getEvent(id);

    if (!event) {
        return {
            title: 'Event Not Found - E-Cell MNIT',
        };
    }

    return {
        title: `${event.title} - E-Cell MNIT`,
        description: event.description,
    };
}

export default async function EventDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const event = await getEvent(id);

    if (!event) {
        notFound();
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    let isRegistered = false;
    if (user) {
        const { data } = await supabase
            .from('event_registrations')
            .select('id')
            .eq('user_id', user.id)
            .eq('event_id', event.id)
            .single();
        isRegistered = !!data;
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div>
            {/* Hero Section */}
            <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
                {/* Background Image or Gradient */}
                {event.image_url ? (
                    <>
                        <div className="absolute inset-0">
                            <img
                                src={event.image_url}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-primary-green/80 via-primary-green/70 to-primary-green/90" />
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-green via-gray-900 to-primary-green">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-golden rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="container-custom relative z-10 text-white py-20">
                    {/* Breadcrumb */}
                    <Link
                        href="/events"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors group"
                    >
                        <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Events
                    </Link>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        {event.featured && (
                            <span className="bg-primary-golden text-white text-sm font-bold px-4 py-2 rounded-full uppercase">
                                Featured
                            </span>
                        )}
                        {event.status === 'upcoming' && (
                            <span className="bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full uppercase animate-pulse">
                                Upcoming
                            </span>
                        )}
                        {event.status === 'ongoing' && (
                            <span className="bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-full uppercase animate-pulse">
                                Live Now
                            </span>
                        )}
                        {event.status === 'past' && (
                            <span className="bg-gray-500 text-white text-sm font-bold px-4 py-2 rounded-full uppercase">
                                Past Event
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl mb-6 max-w-4xl">
                        {event.title}
                    </h1>

                    {/* Event Meta */}
                    <div className="flex flex-wrap gap-6 text-white/90">
                        <div className="flex items-center gap-2">
                            <FiCalendar className="w-5 h-5 text-primary-golden" />
                            <span className="font-medium">{formatDate(event.date)}</span>
                        </div>
                        {event.location && (
                            <div className="flex items-center gap-2">
                                <FiMapPin className="w-5 h-5 text-primary-golden" />
                                <span className="font-medium">{event.location}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <FiTag className="w-5 h-5 text-primary-golden" />
                            <span className="font-medium">{event.category}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Description */}
                            <div>
                                <h2 className="text-3xl font-heading text-primary-green mb-6">
                                    About This Event
                                </h2>
                                <div className="prose prose-lg max-w-none">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {event.detailed_description || event.description}
                                    </p>
                                </div>
                            </div>

                            {/* Agenda Section */}
                            {event.event_details?.agenda && event.event_details.agenda.length > 0 && (
                                <div id="agenda" className="scroll-mt-24">
                                    <h2 className="text-3xl font-heading text-primary-green mb-6 flex items-center gap-3">
                                        <span className="text-4xl">📋</span> Event Agenda
                                    </h2>
                                    <div className="space-y-4">
                                        {event.event_details.agenda.map((item) => (
                                            <div key={item.id} className="flex gap-4 md:gap-6 p-6 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                                                <div className="shrink-0 flex flex-col items-center">
                                                    <div className="font-mono font-bold text-primary-golden text-lg whitespace-nowrap">
                                                        {item.time}
                                                    </div>
                                                    <div className="w-px h-full bg-gray-200 mt-2"></div>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                                    <p className="text-gray-600">{item.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Speakers Section */}
                            {event.event_details?.speakers && event.event_details.speakers.length > 0 && (
                                <div id="speakers" className="scroll-mt-24">
                                    <h2 className="text-3xl font-heading text-primary-green mb-6 flex items-center gap-3">
                                        <span className="text-4xl">🎤</span> Speakers & Guests
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {event.event_details.speakers.map((speaker) => (
                                            <div key={speaker.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all group">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-primary-golden/20">
                                                        {speaker.image_url ? (
                                                            <img src={speaker.image_url} alt={speaker.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-3xl">👤</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900">{speaker.name}</h3>
                                                        <p className="text-primary-golden font-medium">{speaker.role}</p>
                                                        <p className="text-sm text-gray-500">{speaker.company}</p>
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{speaker.bio}</p>
                                                <div className="flex gap-3">
                                                    {speaker.linkedin_url && (
                                                        <a href={speaker.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0077b5] transition-colors">
                                                            <span className="sr-only">LinkedIn</span>
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Gallery Section */}
                            {event.event_details?.gallery && event.event_details.gallery.length > 0 && (
                                <div id="gallery" className="scroll-mt-24">
                                    <h2 className="text-3xl font-heading text-primary-green mb-6 flex items-center gap-3">
                                        <span className="text-4xl">📸</span> Photo Gallery
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {event.event_details.gallery.map((image) => (
                                            <div key={image.id} className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                                                <img src={image.url} alt="Event moment" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Event Registration */}
                        {event.registrations_open ? (
                            <div className="mb-8">
                                <EventRegistration
                                    event={{
                                        id: event.id,
                                        title: event.title,
                                        is_team_event: (event as any).is_team_event || false,
                                        min_team_size: (event as any).min_team_size || 1,
                                        max_team_size: (event as any).max_team_size || 1,
                                        registration_link: null
                                    }}
                                    user={user}
                                />
                            </div>
                        ) : (
                            <div className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                                <h3 className="text-xl font-heading text-gray-400 mb-2">
                                    Registrations Closed
                                </h3>
                                <p className="text-gray-500">
                                    Registration for this event is currently closed.
                                </p>
                            </div>
                        )}

                        {/* Share Card */}
                        <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-100">
                            <h3 className="text-xl font-heading text-primary-green mb-4">
                                Share This Event
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Social sharing options will be added here
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Events Placeholder */}
            <section className="section bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-heading text-primary-green mb-4">
                            Related Events
                        </h2>
                        <div className="w-20 h-1 bg-gradient-to-r from-primary-golden to-yellow-700 mx-auto rounded-full" />
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                        <div className="text-6xl mb-4">🎯</div>
                        <h3 className="text-xl font-heading text-gray-400 mb-2">
                            Related Events
                        </h3>
                        <p className="text-gray-500">
                            Similar events will be suggested here
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
