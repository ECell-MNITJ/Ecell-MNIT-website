'use client';
import Link from 'next/link';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const { settings } = useSiteSettings();

    const quickLinks = [
        { name: 'Home', href: '/' },
        { name: 'About Us', href: '/about' },
        { name: 'Events', href: '/events' },
        { name: 'Contact', href: '/contact' },
    ];

    const socialLinks = [
        { name: 'Facebook', icon: 'fab fa-facebook-f', href: settings.facebook_url },
        { name: 'Twitter', icon: 'fab fa-twitter', href: settings.twitter_url },
        { name: 'Instagram', icon: 'fab fa-instagram', href: settings.instagram_url },
        { name: 'LinkedIn', icon: 'fab fa-linkedin-in', href: settings.linkedin_url },
        { name: 'YouTube', icon: 'fab fa-youtube', href: settings.youtube_url },
    ].filter(link => link.href && link.href.trim() !== '');

    return (
        <footer className="bg-gradient-to-br from-primary-green to-gray-900 text-white">
            <div className="container-custom py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* About Section */}
                    <div>
                        <h3 className="text-2xl font-heading text-primary-golden mb-4">
                            E-CELL MNIT
                        </h3>
                        <p className="text-white/80 mb-6 leading-relaxed">
                            Entrepreneurship Cell at Malaviya National Institute of Technology,
                            Jaipur. Fostering innovation and entrepreneurship among students.
                        </p>
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-11 h-11 flex items-center justify-center bg-white/10 rounded-full hover:bg-primary-golden transition-all duration-300 hover:-translate-y-1"
                                    aria-label={social.name}
                                >
                                    <i className={social.icon} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-heading text-primary-golden mb-4">
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-white/80 hover:text-primary-golden transition-colors inline-flex items-center gap-2 group"
                                    >
                                        <span className="text-primary-golden">▸</span>
                                        <span className="group-hover:translate-x-1 transition-transform">
                                            {link.name}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-xl font-heading text-primary-golden mb-4">
                            Contact Info
                        </h3>
                        <ul className="space-y-4 text-white/80">
                            <li className="flex items-start gap-3">
                                <i className="fas fa-map-marker-alt text-primary-golden mt-1" />
                                <span>{settings.address || 'MNIT Jaipur, Rajasthan, India'}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <i className="fas fa-envelope text-primary-golden" />
                                <a href={`mailto:${settings.contact_email || 'ecell@mnit.ac.in'}`} className="hover:text-primary-golden transition-colors">
                                    {settings.contact_email || 'ecell@mnit.ac.in'}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <i className="fas fa-phone text-primary-golden" />
                                <span>{settings.contact_phone || '+91 XXX XXX XXXX'}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/60">
                    <p>
                        &copy; {currentYear} E-Cell MNIT Jaipur. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Font Awesome CDN */}
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            />
        </footer>
    );
}
