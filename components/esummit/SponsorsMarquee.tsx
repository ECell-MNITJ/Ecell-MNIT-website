'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface Sponsor {
    id: string;
    name: string | null;
    logo_url: string | null;
    website_url: string | null;
    brand_contributor: string | null;
}

interface SponsorsMarqueeProps {
    sponsors: Sponsor[];
    heading: string;
    isVisible: boolean;
    reverse?: boolean;
    duration?: number;
    aspectRatio?: 'square' | 'portrait';
    size?: 'normal' | 'large';
    noSection?: boolean;
}

export function SponsorsMarquee({
    sponsors,
    heading,
    isVisible,
    reverse = false,
    duration = 30,
    aspectRatio = 'square',
    size = 'normal',
    noSection = false
}: SponsorsMarqueeProps) {
    if (!isVisible || !sponsors || sponsors.length === 0) return null;

    // Duplicate sponsors to create a seamless infinite loop
    const duplicatedSponsors = [...sponsors, ...sponsors];

    const content = (
        <>
            {/* Background glowing orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-esummit-primary/10 blur-[120px] rounded-[100%] pointer-events-none" />

            {heading && (
                <div className="container mx-auto px-6 mb-16 relative z-10 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-esummit-accent to-esummit-primary inline-block uppercase tracking-wider font-heading"
                    >
                        {heading}
                    </motion.h2>
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100px" }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="h-1 bg-gradient-to-r from-esummit-accent to-esummit-primary mx-auto mt-6"
                    />
                </div>
            )}

            <div className="relative w-full overflow-hidden flex items-center group">
                {/* Left/Right Gradient Fades */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-esummit-bg/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-esummit-bg/80 to-transparent z-10 pointer-events-none" />

                <motion.div
                    key={`${reverse}-${duration}-${sponsors.length}`}
                    className="flex gap-4 md:gap-8 items-center flex-nowrap shrink-0"
                    animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
                    transition={{
                        ease: "linear",
                        duration: duration,
                        repeat: Infinity,
                    }}
                >
                    {/* Only mapping double for standard loop mechanics */}
                    {[...duplicatedSponsors, ...duplicatedSponsors].map((sponsor, index) => (
                        <div key={`${sponsor.id}-${index}`} className="flex flex-col items-center gap-4 shrink-0">
                            <div
                                className={`group/card relative ${size === 'large' ? 'w-44 md:w-64' : 'w-40 md:w-56'} ${aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-square'} flex items-center justify-center bg-gray-900/40 rounded-xl border border-white/5 hover:border-esummit-primary/50 hover:bg-white/5 transition-all duration-300 overflow-hidden`}
                            >
                                {sponsor.website_url ? (
                                    <a
                                        href={sponsor.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full h-full flex items-center justify-center"
                                        aria-label={`Visit ${sponsor.name || 'Sponsor'} website`}
                                    >
                                        <SponsorImage sponsor={sponsor} />
                                    </a>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <SponsorImage sponsor={sponsor} />
                                    </div>
                                )}
                            </div>

                            {/* Sponsor Name & Brand Contributor */}
                            <div className={`text-center space-y-1 ${size === 'large' ? 'max-w-[176px] md:max-w-[256px]' : 'max-w-[160px] md:max-w-[224px]'}`}>
                                {sponsor.name && (
                                    <h4 className={`text-white font-black ${size === 'large' ? 'text-lg md:text-base' : 'text-lg md:text-base'} truncate tracking-[0.15em] uppercase`}>
                                        {sponsor.name}
                                    </h4>
                                )}
                                {sponsor.brand_contributor && (
                                    <p className="text-esummit-primary font-medium text-[10px] md:text-xs uppercase tracking-wider leading-tight">
                                        {sponsor.brand_contributor}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </>
    );

    if (noSection) return content;

    return (
        <section className="py-24 bg-esummit-bg/40 backdrop-blur-md border-y border-white/5 relative overflow-hidden">
            {content}
        </section>
    );
}

function SponsorImage({ sponsor }: { sponsor: Sponsor }) {
    if (!sponsor.logo_url) {
        return <span className="text-xl font-bold text-gray-300">{sponsor.name || ''}</span>;
    }

    return (
        <div className="relative w-full h-full">
            <Image
                src={sponsor.logo_url}
                alt={`${sponsor.name || 'Sponsor'} logo`}
                fill
                unoptimized={true}
                className="object-cover opacity-70 group-hover/card:opacity-100 transition-opacity duration-300 filter group-hover/card:drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]"
            />
        </div>
    );
}
