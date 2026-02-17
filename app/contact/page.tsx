'use client';

import { useState, FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import PageLayout3DWrapper from '@/components/3d/PageLayout3DWrapper';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Form validation
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            setStatus('error');
            return;
        }

        try {
            const supabase = createClient();
            const { error } = await supabase.from('contact_messages').insert({
                name: formData.name,
                email: formData.email,
                subject: formData.subject,
                message: formData.message,
                source: 'ecell'
            });

            if (error) throw error;

            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            console.error('Error sending message:', error);
            setStatus('error'); // Or add a specific error state
        }
    };

    const { settings } = useSiteSettings();

    // Map settings to contact info structure
    const contactInfo = [
        {
            icon: 'fas fa-map-marker-alt',
            title: 'Address',
            content: settings.address || 'Malaviya National Institute of Technology\nJaipur, Rajasthan, India',
        },
        {
            icon: 'fas fa-envelope',
            title: 'Email',
            content: settings.contact_email || 'ecell@mnit.ac.in',
            link: `mailto:${settings.contact_email || 'ecell@mnit.ac.in'}`,
        },
        {
            icon: 'fas fa-phone',
            title: 'Phone',
            content: settings.contact_phone || '+91 XXX XXX XXXX',
            link: `tel:${settings.contact_phone?.replace(/\D/g, '')}`,
        },
    ];

    // Map settings to social links
    const socialLinks = [
        { name: 'Facebook', icon: 'fab fa-facebook-f', href: settings.facebook_url },
        { name: 'Twitter', icon: 'fab fa-twitter', href: settings.twitter_url },
        { name: 'Instagram', icon: 'fab fa-instagram', href: settings.instagram_url },
        { name: 'LinkedIn', icon: 'fab fa-linkedin-in', href: settings.linkedin_url },
        { name: 'YouTube', icon: 'fab fa-youtube', href: settings.youtube_url },
    ].filter(link => link.href && link.href.trim() !== ''); // Only show links that exist and are not just whitespace

    // Dynamic height calculation
    // Base 2.0 covers Hero and Form. Each contact info item adds a small amount.
    const totalPages = 2.0 + (contactInfo.length * 0.1);

    // Mobile: Stacked layout requires more space
    const mobilePages = 3.5 + (contactInfo.length * 0.15);

    return (
        <PageLayout3DWrapper pages={totalPages} mobilePages={mobilePages}>
            <div className="w-full">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 flex flex-col justify-center items-center text-center pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/10 max-w-4xl pointer-events-auto shadow-2xl">
                        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl mb-6 text-white">Get In Touch</h1>
                        <p className="text-lg md:text-xl max-w-3xl mx-auto text-white/90">
                            Have questions? We'd love to hear from you
                        </p>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="section pointer-events-none pb-40">
                    <div className="container-custom pointer-events-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                            {/* Contact Information */}
                            <div className="space-y-8 bg-zinc-900/80 backdrop-blur-xl p-8 rounded-2xl border border-zinc-700 shadow-2xl h-fit">
                                <div>
                                    <h2 className="text-3xl font-heading text-primary-green mb-6">Contact Information</h2>
                                    <p className="text-gray-300 mb-8">
                                        Feel free to reach out to us for any queries, collaborations, or just to say hello!
                                    </p>
                                </div>

                                {contactInfo.map((info, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-4 p-6 bg-black/40 rounded-xl hover:bg-primary-green/20 hover:border-primary-green/50 border border-white/5 transition-all duration-300 group"
                                    >
                                        <div className="text-3xl text-primary-golden group-hover:scale-110 transition-transform">
                                            <i className={info.icon} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-heading mb-2 text-white">{info.title}</h3>
                                            {info.link ? (
                                                <a href={info.link} className="text-gray-400 group-hover:text-white whitespace-pre-line transition-colors">
                                                    {info.content}
                                                </a>
                                            ) : (
                                                <p className="text-gray-400 group-hover:text-white whitespace-pre-line transition-colors">
                                                    {info.content}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Social Media */}
                                <div>
                                    <h3 className="text-xl font-heading text-primary-green mb-4">Follow Us</h3>
                                    <div className="flex gap-4">
                                        {socialLinks.map((social) => (
                                            <a
                                                key={social.name}
                                                href={social.href || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full hover:bg-primary-golden hover:text-white transition-all duration-300 hover:scale-110 text-gray-300 border border-white/10"
                                                aria-label={social.name}
                                            >
                                                <i className={social.icon} />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-2xl border border-zinc-700 shadow-2xl">
                                <h2 className="text-3xl font-heading text-primary-green mb-6">Send Us a Message</h2>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="name" className="block text-gray-300 font-semibold mb-2">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:border-primary-golden focus:outline-none transition-colors text-white placeholder-gray-500"
                                            placeholder="Your name"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-gray-300 font-semibold mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:border-primary-golden focus:outline-none transition-colors text-white placeholder-gray-500"
                                            placeholder="your.email@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-gray-300 font-semibold mb-2">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:border-primary-golden focus:outline-none transition-colors text-white placeholder-gray-500"
                                            placeholder="What is this about?"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-gray-300 font-semibold mb-2">
                                            Message *
                                        </label>
                                        <textarea
                                            id="message"
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:border-primary-golden focus:outline-none transition-colors resize-none text-white placeholder-gray-500"
                                            placeholder="Your message here..."
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-primary w-full bg-primary-golden hover:bg-yellow-600 text-black font-bold">
                                        Send Message
                                    </button>

                                    {status === 'success' && (
                                        <div className="p-4 bg-green-900/50 border border-green-500/50 text-green-300 rounded-lg">
                                            Thank you! Your message has been sent successfully.
                                        </div>
                                    )}

                                    {status === 'error' && (
                                        <div className="p-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg">
                                            Please fill in all required fields.
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </PageLayout3DWrapper>
    );
}
