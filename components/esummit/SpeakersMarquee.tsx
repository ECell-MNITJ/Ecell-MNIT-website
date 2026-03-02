'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface Speaker {
    id: string;
    name: string;
    image_url: string | null;
    designation: string | null;
    linkedin_url: string | null;
}

interface SpeakersMarqueeProps {
    speakers: Speaker[];
    heading: string;
    isVisible: boolean;
}

export function SpeakersMarquee({ speakers, heading, isVisible }: SpeakersMarqueeProps) {
    if (!isVisible || !speakers || speakers.length === 0) return null;

    // Duplicate speakers to create a seamless infinite loop
    const duplicatedSpeakers = [...speakers, ...speakers];

    return (
        <section className="py-24 mt-12 md:mt-16 bg-esummit-bg/40 backdrop-blur-md border-y border-white/5 relative overflow-hidden">
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
                    className="flex gap-4 md:gap-8 items-center flex-nowrap shrink-0"
                    animate={{ x: ["-50%", "0%"] }}
                    transition={{
                        ease: "linear",
                        duration: 15,
                        repeat: Infinity,
                    }}
                >
                    {[...duplicatedSpeakers, ...duplicatedSpeakers].map((speaker, index) => (
                        <div
                            key={`${speaker.id}-${index}`}
                            className="shrink-0 group/card relative w-48 md:w-64 aspect-[3/4] flex flex-col items-center justify-start bg-gray-900/40 rounded-xl border border-white/5 hover:border-esummit-primary/50 hover:bg-white/5 transition-all duration-300 overflow-hidden"
                        >
                            {speaker.linkedin_url ? (
                                <a
                                    href={speaker.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full h-full flex flex-col items-center"
                                    aria-label={`Visit ${speaker.name} LinkedIn`}
                                >
                                    <SpeakerContent speaker={speaker} />
                                </a>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center">
                                    <SpeakerContent speaker={speaker} />
                                </div>
                            )}
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

function SpeakerContent({ speaker }: { speaker: Speaker }) {
    return (
        <>
            <div className="relative w-full h-3/4 bg-zinc-900/50">
                {speaker.image_url ? (
                    <Image
                        src={speaker.image_url}
                        alt={speaker.name}
                        fill
                        className="object-cover object-top filter grayscale group-hover/card:grayscale-0 transition-all duration-500"
                        sizes="(max-width: 768px) 192px, 256px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-400 text-center px-4">{speaker.name}</span>
                    </div>
                )}
            </div>
            <div className="flex flex-col items-center justify-center h-1/4 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-lg font-bold text-white text-center truncate w-full">{speaker.name}</h3>
                {speaker.designation && (
                    <p className="text-xs text-esummit-primary text-center mt-1 truncate w-full">{speaker.designation}</p>
                )}
            </div>
        </>
    );
}
