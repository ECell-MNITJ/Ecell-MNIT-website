'use client';

import Link from 'next/link';

interface Startup {
    id: string;
    name: string;
    logo_url: string | null;
    website_url: string | null;
    description: string | null;
}

interface StartupMarqueeProps {
    startups: Startup[];
}

export default function StartupMarquee({ startups }: StartupMarqueeProps) {
    if (startups.length === 0) return null;

    // Duplicate list to ensure smooth continuous scroll even with few items
    const marqueeItems = [...startups, ...startups];

    return (
        <div className="w-full overflow-hidden py-12 relative">
            {/* Gradient Masks */}
            <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none"></div>

            <div className="flex w-max animate-marquee space-x-8 hover:[animation-play-state:paused] py-4">
                {marqueeItems.map((startup, index) => (
                    <div
                        key={`${startup.id}-${index}`}
                        className="flex-shrink-0 w-72 h-80 bg-[#1f2937] rounded-2xl border border-gray-700 p-6 flex flex-col items-center text-center hover:border-primary-golden hover:-translate-y-2 transition-all duration-300 relative group shadow-xl"
                    >
                        {/* Logo */}
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 p-2 shadow-lg z-10 group-hover:scale-110 transition-transform duration-300 border-4 border-[#1f2937]">
                            {startup.logo_url ? (
                                <img
                                    src={startup.logo_url}
                                    alt={startup.name}
                                    className="w-full h-full object-contain rounded-full"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-gray-800">{startup.name.charAt(0)}</span>
                            )}
                        </div>

                        {/* Name */}
                        <h3 className="text-xl font-bold text-white mb-3 z-10">{startup.name}</h3>

                        {/* Description */}
                        <p className="text-gray-400 text-xs line-clamp-4 z-10 leading-relaxed px-2">
                            {startup.description || 'Innovative startup incubated at MNIT.'}
                        </p>

                        {/* Link Overlay */}
                        {startup.website_url && (
                            <Link
                                href={startup.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute inset-0 z-20 focus:outline-none rounded-2xl"
                                aria-label={`Visit ${startup.name}`}
                            />
                        )}
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 8s linear infinite;
                }
            `}</style>
        </div>
    );
}
