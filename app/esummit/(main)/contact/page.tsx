'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.from('contact_messages').insert({
                name: formData.name,
                email: formData.email,
                subject: formData.subject,
                message: formData.message,
                source: 'esummit'
            });

            if (error) throw error;

            toast.success('Message sent successfully!');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error: any) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-esummit-bg min-h-screen text-white pt-24 pb-12 overflow-x-hidden selection:bg-esummit-primary selection:text-white font-body">
            <Toaster position="top-right"
                toastOptions={{
                    style: {
                        background: '#0f0b29',
                        color: '#fff',
                        border: '1px solid rgba(157,78,221,0.3)',
                    },
                }}
            />

            {/* Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-esummit-primary/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-esummit-accent/5 rounded-full blur-[128px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
                        GET IN <span className="text-transparent bg-clip-text bg-gradient-to-r from-esummit-primary to-esummit-accent">TOUCH</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Have questions about E-Summit 2024? We're here to help. Reach out to us for any queries or partnerships.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div className="bg-esummit-card/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:border-esummit-primary/50 transition-colors group">
                            <div className="w-12 h-12 bg-esummit-primary/20 rounded-xl flex items-center justify-center text-esummit-accent text-2xl mb-4 group-hover:scale-110 transition-transform">
                                <FiMail />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Email Us</h3>
                            <p className="text-gray-400 mb-4">For general queries and support</p>
                            <a href="mailto:esummit@mnit.ac.in" className="text-lg font-medium text-white hover:text-esummit-primary transition-colors">
                                esummit@mnit.ac.in
                            </a>
                        </div>

                        <div className="bg-esummit-card/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:border-esummit-primary/50 transition-colors group">
                            <div className="w-12 h-12 bg-esummit-primary/20 rounded-xl flex items-center justify-center text-esummit-accent text-2xl mb-4 group-hover:scale-110 transition-transform">
                                <FiPhone />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Call Us</h3>
                            <p className="text-gray-400 mb-4">Mon-Fri from 9am to 6pm</p>
                            <a href="tel:+919876543210" className="text-lg font-medium text-white hover:text-esummit-primary transition-colors block">
                                +91 98765 43210
                            </a>
                        </div>

                        <div className="bg-esummit-card/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:border-esummit-primary/50 transition-colors group">
                            <div className="w-12 h-12 bg-esummit-primary/20 rounded-xl flex items-center justify-center text-esummit-accent text-2xl mb-4 group-hover:scale-110 transition-transform">
                                <FiMapPin />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Visit Us</h3>
                            <p className="text-gray-400">
                                Malaviya National Institute of Technology,<br />
                                JLN Marg, Jaipur, Rajasthan - 302017
                            </p>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="bg-esummit-card/30 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Your Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-esummit-bg/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-esummit-primary/50 focus:bg-esummit-bg/80 transition-all placeholder:text-gray-600"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-esummit-bg/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-esummit-primary/50 focus:bg-esummit-bg/80 transition-all placeholder:text-gray-600"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-esummit-bg/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-esummit-primary/50 focus:bg-esummit-bg/80 transition-all placeholder:text-gray-600"
                                    placeholder="Partnership / General Query"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    className="w-full bg-esummit-bg/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-esummit-primary/50 focus:bg-esummit-bg/80 transition-all placeholder:text-gray-600 resize-none"
                                    placeholder="How can we help you?"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-esummit-primary to-purple-600 text-white font-bold uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(157,78,221,0.4)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Send Message <FiSend />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
