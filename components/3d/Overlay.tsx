'use client';

import SafeScrollHtml from './SafeScrollHtml';
import Link from 'next/link';
import { FiCalendar, FiMapPin } from 'react-icons/fi';
import StartupMarquee from '@/components/StartupMarquee';
import GallerySection from '@/components/GallerySection';

interface OverlayProps {
    events: any[];
    startups: any[];
    stats?: any[];
}

export default function Overlay({ events, startups, stats }: OverlayProps) {

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <SafeScrollHtml style={{ width: '100%', height: '100%', zIndex: 100, position: 'relative' }}>
            {/* Section 1: Hero (Welcome) */}
            <section className="w-full h-screen flex flex-col justify-center items-center px-6 md:px-10 text-center pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/10 max-w-4xl pointer-events-auto shadow-2xl transition-transform hover:scale-[1.01]">
                    <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg tracking-tight">
                        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-golden to-yellow-300">E-Cell MNIT</span>
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-200 font-light drop-shadow-md leading-relaxed">
                        Fostering Innovation, Entrepreneurship, and Leadership.
                    </p>
                    <div className="mt-8 flex gap-4 justify-center">
                        <Link href="/events" className="btn btn-primary bg-primary-golden hover:bg-yellow-600 text-black border-none px-8 py-3 rounded-full font-bold">
                            Explore Events
                        </Link>
                        <Link href="/startups" className="btn btn-outline border-white text-white hover:bg-white/10 px-8 py-3 rounded-full font-bold">
                            Our Startups
                        </Link>
                    </div>
                </div>
            </section>

            {/* Section 2: Highlights (Why E-Cell?) */}
            <section className="w-full h-screen flex flex-col justify-center items-center px-6 md:px-20 pointer-events-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full items-center">
                    {/* Left Column: Core Values */}
                    <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-2xl border border-zinc-700 shadow-2xl w-full pointer-events-auto">
                        <h2 className="text-3xl md:text-4xl font-heading text-primary-green mb-6 border-b border-zinc-700 pb-4">Why E-Cell?</h2>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 group">
                                <span className="text-3xl md:text-4xl p-3 bg-zinc-800 rounded-lg group-hover:bg-primary-green/20 transition-colors">💡</span>
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-white mb-1">Innovation Hub</h3>
                                    <p className="text-gray-400 text-sm md:text-base">Ideate, innovate, and transform ideas into reality.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 group">
                                <span className="text-3xl md:text-4xl p-3 bg-zinc-800 rounded-lg group-hover:bg-primary-green/20 transition-colors">👥</span>
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-white mb-1">Community</h3>
                                    <p className="text-gray-400 text-sm md:text-base">Join a vibrant community of like-minded entrepreneurs.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 group">
                                <span className="text-3xl md:text-4xl p-3 bg-zinc-800 rounded-lg group-hover:bg-primary-green/20 transition-colors">🚀</span>
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-white mb-1">Startup Support</h3>
                                    <p className="text-gray-400 text-sm md:text-base">Mentorship, funding, and resources for your venture.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Join the Movement (New Content) */}
                    <div className="bg-gradient-to-br from-primary-golden/10 to-black/60 backdrop-blur-xl p-8 rounded-2xl border border-primary-golden/30 shadow-2xl w-full pointer-events-auto h-full flex flex-col justify-center text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-heading text-white mb-6"> <span className="text-primary-golden">Build</span> Your Legacy</h2>
                        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                            "Entrepreneurs are not born, they are made." <br />
                            Embark on a journey of leadership, learning, and limitless possibilities. Whether you have an idea or just the passion to create, E-Cell is your launchpad.
                        </p>

                        <div className="flex flex-col md:flex-row gap-4">
                            <Link href="/register" className="btn bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105">
                                Join Now
                            </Link>
                            <Link href="/about" className="btn border border-white text-white hover:bg-white/10 px-8 py-3 rounded-full font-bold transition-all">
                                Learn More
                            </Link>
                        </div>

                        <div className="mt-8 flex gap-4 text-gray-400 text-sm md:justify-start justify-center">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-primary-green rounded-full"></span> Mentorship</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-primary-golden rounded-full"></span> Networking</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Growth</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Stats & Vision */}
            <section className="w-full h-screen flex flex-col justify-center items-center px-6 md:px-20 pointer-events-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full">
                    {/* Vision Card */}
                    <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-2xl border border-zinc-700 shadow-2xl pointer-events-auto flex flex-col justify-center">
                        <h2 className="text-3xl md:text-4xl font-heading text-white mb-6">Our Vision</h2>
                        <p className="text-gray-300 text-lg leading-relaxed mb-6">
                            To create an ecosystem that fosters innovation and entrepreneurship among students, providing them with the platform, resources, and mentorship needed to transform their ideas into successful ventures.
                        </p>
                        <p className="text-gray-400 text-sm">
                            We believe in the power of student-led innovation to drive social and economic change.
                        </p>
                    </div>

                    {/* Dynamic Stats Grid */}
                    <div className="bg-black/70 backdrop-blur-xl p-8 rounded-2xl border border-primary-golden/40 pointer-events-auto shadow-[0_0_30px_rgba(251,191,36,0.1)] flex flex-col justify-center">
                        <h2 className="text-3xl md:text-5xl font-heading text-white mb-8 text-right">Our Impact</h2>
                        <div className="grid grid-cols-2 gap-8 md:gap-y-12">
                            {stats && stats.length > 0 ? (
                                stats.map((stat: any) => (
                                    <div key={stat.id} className="text-right">
                                        <div className="text-3xl md:text-5xl font-bold text-primary-golden mb-2">{stat.value}</div>
                                        <div className="text-gray-300 text-xs md:text-sm uppercase tracking-widest font-semibold">{stat.label}</div>
                                    </div>
                                ))
                            ) : (
                                // Fallback static stats if no data
                                <>
                                    <div className="text-right p-2">
                                        <div className="text-3xl md:text-5xl font-bold text-primary-golden mb-2">50+</div>
                                        <div className="text-gray-300 text-xs md:text-sm uppercase tracking-widest font-semibold">Events</div>
                                    </div>
                                    <div className="text-right p-2">
                                        <div className="text-3xl md:text-5xl font-bold text-primary-golden mb-2">500+</div>
                                        <div className="text-gray-300 text-xs md:text-sm uppercase tracking-widest font-semibold">Students</div>
                                    </div>
                                    <div className="text-right p-2">
                                        <div className="text-3xl md:text-5xl font-bold text-primary-golden mb-2">20+</div>
                                        <div className="text-gray-300 text-xs md:text-sm uppercase tracking-widest font-semibold">Startups</div>
                                    </div>
                                    <div className="text-right p-2">
                                        <div className="text-3xl md:text-5xl font-bold text-primary-golden mb-2">100+</div>
                                        <div className="text-gray-300 text-xs md:text-sm uppercase tracking-widest font-semibold">Workshops</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4: Recent Events */}
            <section className="w-full min-h-screen flex flex-col justify-center items-center px-4 md:px-10 pointer-events-none py-20 mb-20">
                <div className="w-full max-w-7xl pointer-events-auto">
                    <div className="text-center mb-16 bg-black/60 backdrop-blur-md px-8 py-6 rounded-2xl inline-block mx-auto border border-white/5">
                        <h2 className="text-3xl md:text-5xl font-heading text-primary-green mb-2">Recent Events</h2>
                        <p className="text-gray-300">Check out our latest initiatives</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {events.length > 0 ? (
                            events.map((event) => (
                                <Link
                                    key={event.id}
                                    href={`/events/${event.id}`}
                                    className="group bg-zinc-900/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full border border-zinc-700 hover:border-primary-golden/50"
                                >
                                    <div className="relative h-48 bg-gradient-to-br from-gray-800 to-black overflow-hidden">
                                        {event.image_url ? (
                                            <img
                                                src={event.image_url}
                                                alt={event.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center opacity-30">
                                                <span className="text-5xl">🎯</span>
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-black/60 backdrop-blur-sm text-primary-golden text-[10px] font-bold px-3 py-1 rounded-full uppercase border border-primary-golden/30">
                                                {event.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                                            <span className="flex items-center gap-2">
                                                <FiCalendar className="text-primary-golden text-sm" />
                                                {formatDate(event.date)}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-heading text-white mb-3 group-hover:text-primary-golden transition-colors line-clamp-1">
                                            {event.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">
                                            {event.description}
                                        </p>
                                        <div className="mt-auto text-primary-golden text-sm font-semibold group-hover:translate-x-1 transition-transform flex items-center">
                                            View Details <i className="fas fa-arrow-right ml-2" />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-10 bg-black/50 rounded-xl border border-white/10">
                                <p className="text-gray-400">No events found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>



            {/* Section 5: Startups Link */}
            <section className="w-full h-screen flex flex-col justify-center items-center px-4 md:px-10 text-center pointer-events-none pb-20">
                <div className="bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl p-8 md:p-14 rounded-3xl border border-gray-800 max-w-5xl w-full pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <h2 className="text-3xl md:text-5xl font-heading text-white mb-10">
                        Startups
                    </h2>

                    <div className="mb-12 bg-white/5 rounded-xl py-4">
                        <StartupMarquee startups={startups || []} />
                    </div>

                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg">
                        We support innovative ventures that solve real-world problems.
                    </p>

                    <Link href="/startups" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-black transition-all duration-200 bg-primary-golden border border-transparent rounded-full hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                        View All Startups
                    </Link>
                </div>
            </section>
        </SafeScrollHtml>
    );
}
