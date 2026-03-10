'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function CANavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };

        window.addEventListener('scroll', handleScroll);
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            subscription.unsubscribe();
        };
    }, []);

    const navLinks = [
        { name: 'ABOUT US', href: '#about-us' },
        { name: 'WHY US?', href: '#why-us' },
        { name: 'T&C', href: '#terms' },
        { name: 'CONTACT US', href: '#contact' },
    ];

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith('#')) {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
            setIsMenuOpen(false);
        }
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="fixed top-0 left-0 w-full z-50 px-0 md:px-8 pt-4"
        >
            <motion.div
                animate={{
                    borderRadius: isMenuOpen ? 24 : 50,
                }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="w-full bg-esummit-card/90 md:bg-esummit-card/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-esummit-primary/20 py-3 pl-0 pr-4 md:pr-10"
            >
                <div className="flex items-center justify-between">
                    <Link href="/esummit" className="group" suppressHydrationWarning>
                        <div className="relative h-6 md:h-8 w-28 md:w-32 flex items-center justify-center overflow-hidden transform group-hover:scale-110 transition-transform duration-300">
                            <Image
                                src="/images/esummit-logo.png"
                                alt="E-Summit Logo"
                                fill
                                sizes="(max-width: 768px) 128px, 144px"
                                className="object-contain object-center scale-[1.22]"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <ul className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    onClick={(e) => scrollToSection(e, link.href)}
                                    className={`relative text-sm tracking-widest uppercase font-bold transition-colors duration-300 text-gray-400 hover:text-white cursor-pointer`}
                                >
                                    {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* Auth Buttons (Desktop) */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <Link
                                href="/esummit/profile"
                                className="flex items-center gap-2 bg-esummit-primary/20 hover:bg-esummit-primary text-esummit-accent hover:text-white border border-esummit-primary/50 px-6 py-2.5 rounded-full font-bold uppercase text-sm tracking-wide transition-all duration-300 hover:shadow-[0_0_20px_rgba(157,78,221,0.5)] group"
                            >
                                <FiUser className="group-hover:rotate-12 transition-transform" />
                                Profile
                            </Link>
                        ) : (
                            <Link
                                href="/esummit/login"
                                className="relative overflow-hidden bg-white text-black px-8 py-2.5 rounded-full font-black uppercase text-sm tracking-wide hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-105 transition-all duration-300 group"
                            >
                                <span className="relative z-10">Login</span>
                                <div className="absolute inset-0 bg-esummit-accent opacity-0 group-hover:opacity-10 transition-opacity" />
                            </Link>
                        )}
                    </div>


                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden flex flex-col justify-center items-center w-10 h-10 z-50 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <div className="relative w-6 h-5">
                            <motion.span
                                animate={isMenuOpen ? { rotate: 45, y: 10 } : { rotate: 0, y: 0 }}
                                className="absolute left-0 w-6 h-0.5 bg-white origin-center"
                            />
                            <motion.span
                                animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                                className="absolute left-0 top-[10px] w-6 h-0.5 bg-white"
                            />
                            <motion.span
                                animate={isMenuOpen ? { rotate: -45, y: -10 } : { rotate: 0, y: 20 }}
                                className="absolute left-0 w-6 h-0.5 bg-white origin-center"
                            />
                        </div>
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                            className="md:hidden overflow-y-auto max-h-[85vh] mt-4"
                        >
                            <ul className="flex flex-col gap-4 pt-6 pb-4">
                                {navLinks.map((link) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.href}
                                            className={`block py-4 px-6 text-center font-bold uppercase tracking-wider rounded-xl transition-all bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer`}
                                            onClick={(e) => scrollToSection(e, link.href)}
                                        >
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                                <li className="pt-4 flex flex-col gap-4 border-t border-white/10 mt-2">
                                    {user ? (
                                        <Link
                                            href="/esummit/profile"
                                            className="flex items-center justify-center gap-3 py-4 px-6 bg-esummit-primary/10 border border-esummit-primary text-esummit-primary font-bold uppercase tracking-wider rounded-xl"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <FiUser className="w-5 h-5" />
                                            Profile
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/esummit/login"
                                            className="block py-4 px-6 text-center bg-white text-black font-bold uppercase tracking-wider rounded-xl hover:bg-gray-200"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Login
                                        </Link>
                                    )}
                                </li>
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.nav>
    );
}
