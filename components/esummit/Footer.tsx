'use client';
import Link from 'next/link';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export default function EsFooter({ user }: { user: any }) {
    const currentYear = new Date().getFullYear();
    const { settings } = useSiteSettings();

    const socialLinks = [
        { name: 'Instagram', icon: 'fab fa-instagram', href: settings.instagram_url },
        { name: 'LinkedIn', icon: 'fab fa-linkedin-in', href: settings.linkedin_url },
        { name: 'Twitter', icon: 'fab fa-twitter', href: settings.twitter_url },
    ].filter(link => link.href);

    return (
        <footer className="bg-esummit-bg text-white border-t border-white/5 relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-esummit-primary/50 to-transparent shadow-[0_0_20px_rgba(157,78,221,0.5)]" />

            <div className="container-custom py-16 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                    {/* Brand */}
                    <div className="text-center md:text-left">
                        <h3 className="text-3xl font-black tracking-widest mb-2">
                            E-SUMMIT <span className="text-transparent bg-clip-text bg-gradient-to-r from-esummit-primary to-esummit-accent">24</span>
                        </h3>
                        <p className="text-gray-400 text-sm tracking-wide">
                            Where Innovation Meets Opportunity
                        </p>
                    </div>

                    {/* Socials */}
                    <div className="flex gap-8">
                        {socialLinks.map((social) => (
                            <a
                                key={social.name}
                                href={social.href || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-esummit-accent transition-all duration-300 text-2xl hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]"
                                aria-label={social.name}
                            >
                                <i className={social.icon} />
                            </a>
                        ))}
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-8 text-sm font-medium tracking-wide text-gray-400">
                        <Link href="/esummit" className="hover:text-esummit-primary transition-colors">Home</Link>
                        <Link href="/esummit/events" className="hover:text-esummit-primary transition-colors">Events</Link>
                        <Link href="/esummit/contact" className="hover:text-esummit-primary transition-colors">Contact</Link>
                        {!user && (
                            <>
                                <Link href="/esummit/login" className="hover:text-esummit-primary transition-colors">Login</Link>
                                <Link href="/esummit/signup" className="hover:text-esummit-primary transition-colors">Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="border-t border-white/5 mt-12 pt-8 text-center text-gray-600 text-xs tracking-widest uppercase">
                    <p>
                        &copy; {currentYear} E-Cell MNIT Jaipur. All rights reserved.
                    </p>
                </div>
            </div>
            {/* Font Awesome CDN (if not already loaded globally, but safe to include) */}
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            />
        </footer>
    );
}
