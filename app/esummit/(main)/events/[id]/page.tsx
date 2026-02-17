import { type EventDetails } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FiCalendar, FiMapPin, FiClock, FiShare2, FiMonitor, FiUser, FiInfo, FiArrowLeft, FiTag } from 'react-icons/fi';
import Image from 'next/image';
import EventRegistration from '@/components/EventRegistration';
import EventGallery from '@/components/esummit/EventGallery';

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

    // Team fields
    is_team_event: boolean;
    min_team_size: number;
    max_team_size: number;
    registrations_open: boolean;
}

async function getEvent(id: string): Promise<Event | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('is_esummit', true)
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
            title: 'Event Not Found - E-Summit 2026',
        };
    }

    return {
        title: `${event.title} - E-Summit 2026`,
        description: event.description,
    };
}

export default async function ESummitEventDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const event = await getEvent(id);

    if (!event) {
        notFound();
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="bg-esummit-bg min-h-screen text-white selection:bg-esummit-primary selection:text-white">
            {/* Hero Section */}
            <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
                {/* Background Image or Gradient */}
                {event.image_url ? (
                    <>
                        <div className="absolute inset-0 opacity-40">
                            <img
                                src={event.image_url}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-esummit-bg via-esummit-bg/80 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-b from-esummit-bg/50 to-transparent" />
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-esummit-card via-black to-esummit-bg">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-esummit-primary/30 rounded-full mix-blend-screen filter blur-3xl animate-pulse" />
                            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-esummit-accent/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse delay-1000" />
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="container mx-auto px-4 relative z-10 text-white py-20 text-center">
                    {/* Breadcrumb */}
                    <Link
                        href="/esummit/events"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-esummit-accent mb-8 transition-colors group tracking-widest text-sm uppercase font-medium"
                    >
                        <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Events
                    </Link>

                    {/* Badge */}
                    <div className="flex justify-center mb-8">
                        <span className="bg-esummit-primary/20 border border-esummit-primary/50 text-esummit-accent text-sm font-bold px-6 py-2 rounded-full uppercase tracking-widest backdrop-blur-md shadow-[0_0_15px_rgba(157,78,221,0.3)]">
                            {event.category}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="font-black text-5xl md:text-7xl lg:text-8xl mb-6 max-w-5xl mx-auto bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-esummit-accent tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                        {event.title}
                    </h1>

                    {/* Event Meta */}
                    <div className="flex flex-wrap justify-center gap-6 text-gray-300">
                        <div className="flex items-center gap-3 bg-esummit-card/50 px-6 py-3 rounded-xl border border-white/10 backdrop-blur-sm">
                            <FiCalendar className="w-5 h-5 text-esummit-primary" />
                            <span className="font-bold tracking-wide">{formatDate(event.date)}</span>
                        </div>
                        {event.location && (
                            <div className="flex items-center gap-3 bg-esummit-card/50 px-6 py-3 rounded-xl border border-white/10 backdrop-blur-sm">
                                <FiMapPin className="w-5 h-5 text-esummit-primary" />
                                <span className="font-bold tracking-wide">{event.location}</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-esummit-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-esummit-accent/5 rounded-full blur-[100px]" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Left Column: Details */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Detailed Description */}
                            <div className="bg-esummit-card/30 p-5 md:p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
                                <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-wide flex items-center gap-3">
                                    <span className="w-2 h-8 bg-esummit-accent rounded-full" />
                                    About The Event
                                </h2>
                                <div className="prose prose-lg prose-invert max-w-none text-gray-300">
                                    <p className="whitespace-pre-line leading-relaxed">
                                        {event.detailed_description || event.description}
                                    </p>
                                </div>
                            </div>

                            {/* Agenda Section */}
                            {event.event_details?.agenda && event.event_details.agenda.length > 0 && (
                                <div>
                                    <h2 className="text-3xl font-black text-white mb-8 uppercase tracking-wide flex items-center gap-3">
                                        <span className="w-2 h-8 bg-esummit-primary rounded-full" />
                                        Agenda
                                    </h2>
                                    <div className="space-y-4">
                                        {event.event_details.agenda.map((item) => (
                                            <div key={item.id} className="flex flex-col md:flex-row gap-4 md:gap-8 p-4 md:p-6 bg-esummit-card/30 rounded-2xl border border-white/5 hover:border-esummit-primary/30 transition-all duration-300 hover:bg-esummit-card/50 group">
                                                <div className="shrink-0 flex flex-col items-center justify-center min-w-[100px] bg-esummit-bg/50 rounded-xl p-4 border border-white/5 group-hover:border-esummit-primary/30 transition-colors">
                                                    <div className="font-bold text-esummit-accent text-xl">
                                                        {item.time}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-esummit-primary transition-colors">{item.title}</h3>
                                                    <p className="text-gray-400">{item.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Speakers Section */}
                            {event.event_details?.speakers && event.event_details.speakers.length > 0 && (
                                <div>
                                    <h2 className="text-3xl font-black text-white mb-8 uppercase tracking-wide flex items-center gap-3">
                                        <span className="w-2 h-8 bg-esummit-accent rounded-full" />
                                        Speakers
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {event.event_details.speakers.map((speaker) => (
                                            <div key={speaker.id} className="bg-esummit-card/30 p-4 md:p-6 rounded-2xl border border-white/5 hover:border-esummit-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(157,78,221,0.2)] group">
                                                <div className="flex items-center gap-5 mb-4">
                                                    <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-esummit-primary/30 group-hover:border-esummit-accent transition-colors duration-300 shadow-[0_0_15px_rgba(157,78,221,0.2)]">
                                                        {speaker.image_url ? (
                                                            <img src={speaker.image_url} alt={speaker.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-esummit-bg flex items-center justify-center text-3xl text-gray-500">👤</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white group-hover:text-esummit-accent transition-colors">{speaker.name}</h3>
                                                        <p className="text-esummit-primary font-bold text-sm tracking-wide uppercase">{speaker.role}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{speaker.company}</p>
                                                    </div>
                                                </div>
                                                <p className="text-gray-400 text-sm line-clamp-3 mb-3 leading-relaxed pl-1 border-l-2 border-esummit-primary/20">{speaker.bio}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Gallery Section */}
                            {event.event_details?.gallery && event.event_details.gallery.length > 0 && (
                                <div>
                                    <h2 className="text-3xl font-black text-white mb-8 uppercase tracking-wide flex items-center gap-3">
                                        <span className="w-2 h-8 bg-purple-500 rounded-full" />
                                        Gallery
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {event.event_details.gallery.map((image: any, index: number) => (
                                            <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group cursor-pointer hover:border-esummit-primary/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                                                <img
                                                    src={typeof image === 'string' ? image : image.url}
                                                    alt={typeof image === 'string' ? `Gallery Image ${index + 1}` : image.caption || `Gallery Image ${index + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Registration & Sidebar */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="sticky top-28">
                                {/* Registration Card */}
                                <div className="bg-esummit-card rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-esummit-primary/30 overflow-hidden mb-8 relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-esummit-primary/10 to-transparent pointer-events-none" />


                                    <div className="p-8">
                                        <h3 className="text-2xl font-black text-center text-white mb-8 uppercase tracking-widest border-b border-white/10 pb-4">
                                            Register Now
                                        </h3>
                                        {event.registrations_open ? (
                                            <EventRegistration
                                                event={{
                                                    id: event.id,
                                                    title: event.title,
                                                    is_team_event: event.is_team_event || false,
                                                    min_team_size: event.min_team_size || 1,
                                                    max_team_size: event.max_team_size || 1,
                                                    registration_link: null
                                                }}
                                                user={user}
                                            />
                                        ) : (
                                            <div className="text-center py-6 border-2 border-dashed border-gray-700 rounded-xl bg-black/20">
                                                <h3 className="text-xl font-bold text-gray-400 mb-2 uppercase tracking-wide">Registrations Closed</h3>
                                                <p className="text-sm text-gray-500">Registration for this event is currently closed.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Info Card */}
                                <div className="bg-esummit-card/50 rounded-2xl p-8 border border-white/5 backdrop-blur-sm">
                                    <h4 className="font-bold text-white mb-6 flex items-center gap-3 uppercase tracking-wide border-b border-white/10 pb-4">
                                        <FiInfo className="text-esummit-accent" /> Event Details
                                    </h4>
                                    <ul className="space-y-4 text-sm text-gray-400">
                                        <li className="flex justify-between items-center group">
                                            <span className="text-gray-500">Date:</span>
                                            <span className="font-bold text-white group-hover:text-esummit-primary transition-colors">{formatDate(event.date)}</span>
                                        </li>
                                        <li className="flex justify-between items-center group">
                                            <span className="text-gray-500">Location:</span>
                                            <span className="font-bold text-white group-hover:text-esummit-primary transition-colors">{event.location || 'Online'}</span>
                                        </li>
                                        {event.is_team_event && (
                                            <li className="flex justify-between items-center group">
                                                <span className="text-gray-500">Team Size:</span>
                                                <span className="font-bold text-white group-hover:text-esummit-primary transition-colors">{event.min_team_size} - {event.max_team_size} members</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
