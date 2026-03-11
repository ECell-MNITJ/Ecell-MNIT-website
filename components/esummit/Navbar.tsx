'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function EsNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const pathname = usePathname();
    const supabase = createClient();

    const [isAdmin, setIsAdmin] = useState(false);
    const [isMember, setIsMember] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                checkRole(user);
            }
        };

        const checkRole = async (user: any) => {
            // ... (rest of checkRole)
            let adminRole = false;
            let memberRole = false;

            // Check profile role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single() as any;

            if (profile?.role === 'member') {
                memberRole = true;
            }

            // Check admin whitelist
            if (user.email) {
                const { data: admin } = await supabase
                    .from('admin_whitelist')
                    .select('role')
                    .eq('email', user.email)
                    .single();

                if (admin?.role === 'admin' || admin?.role === 'super_admin') {
                    adminRole = true;
                }
            }

            setIsAdmin(adminRole);
            setIsMember(memberRole);
        };

        window.addEventListener('scroll', handleScroll);
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                checkRole(session.user);
            } else {
                setIsAdmin(false);
                setIsMember(false);
            }
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            subscription.unsubscribe();
        };
    }, []);

    const navLinks = [
        { name: 'Home', href: '/esummit' },
        { name: 'Events', href: '/esummit/events' },
        { name: 'Gallery', href: '/esummit/gallery' },
        { name: 'Contact', href: '/esummit/contact' },
    ];

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
                    <Link href="/" className="group flex items-center" suppressHydrationWarning>
                        <div className="relative h-6 md:h-8 w-24 md:w-32 flex items-center justify-center overflow-hidden transform group-hover:scale-105 transition-transform duration-300">
                            <Image
                                src="/images/esummit-logo.png"
                                alt="E-Summit Logo"
                                fill
                                sizes="(max-width: 768px) 96px, 128px"
                                className="object-contain object-center scale-[1.3]"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <ul className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`relative text-sm tracking-widest uppercase font-bold transition-colors duration-300 hover:text-white ${pathname === link.href ? 'text-white' : 'text-gray-400'}`}
                                >
                                    {link.name}
                                    {pathname === link.href && (
                                        <motion.span
                                            layoutId="underline"
                                            className="absolute -bottom-1 left-0 w-full h-0.5 bg-esummit-accent"
                                        />
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Auth Buttons (Desktop) */}
                    <div className="hidden md:flex items-center gap-4">
                        {(isAdmin || isMember) && (
                            <Link
                                href="/esummit/scan"
                                className="text-gray-300 hover:text-white font-bold uppercase text-sm tracking-wide transition-colors"
                            >
                                Scanner
                            </Link>
                        )}
                        {isAdmin && (
                            <Link
                                href="/esummit/admin"
                                className="text-esummit-primary hover:text-white font-bold uppercase text-sm tracking-wide transition-colors"
                            >
                                Admin
                            </Link>
                        )}
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
                        className="md:hidden flex flex-col justify-center items-center w-10 h-10 z-50 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <div className="relative w-6 h-5 flex flex-col justify-between">
                            <motion.span
                                animate={isMenuOpen ? { rotate: 45, y: 9, width: '100%' } : { rotate: 0, y: 0, width: '100%' }}
                                className="w-full h-0.5 bg-white origin-center"
                            />
                            <motion.span
                                animate={isMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                                className="w-full h-0.5 bg-white"
                            />
                            <motion.span
                                animate={isMenuOpen ? { rotate: -45, y: -9, width: '100%' } : { rotate: 0, y: 0, width: '100%' }}
                                className="w-full h-0.5 bg-white origin-center"
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
                            <ul className="flex flex-col gap-2 pt-6 pb-4 px-2">
                                {navLinks.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className={`block py-4 px-6 text-center font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all duration-300 ${pathname === link.href
                                                ? 'bg-esummit-primary text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-esummit-primary/50'
                                                : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white'
                                                }`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                                <li className="pt-4 flex flex-col gap-3 border-t border-white/10 mt-2">
                                    {(isAdmin || isMember) && (
                                        <Link
                                            href="/esummit/scan"
                                            className="block py-4 px-6 text-center border border-white/10 text-gray-400 font-black uppercase tracking-[0.2em] text-xs rounded-2xl bg-white/5 hover:bg-white/10 hover:text-white transition-all"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Scanner
                                        </Link>
                                    )}
                                    {isAdmin && (
                                        <Link
                                            href="/esummit/admin"
                                            className="block py-4 px-6 text-center border border-esummit-primary/30 text-esummit-primary font-black uppercase tracking-[0.2em] text-xs rounded-2xl bg-esummit-primary/5 hover:bg-esummit-primary/10 transition-all"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Admin Panel
                                        </Link>
                                    )}
                                    {user ? (
                                        <Link
                                            href="/esummit/profile"
                                            className="flex items-center justify-center gap-3 py-4 px-6 bg-esummit-primary/20 border border-esummit-primary-50 text-esummit-accent font-black uppercase tracking-[0.2em] text-xs rounded-2xl"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <FiUser className="w-4 h-4" />
                                            Profile
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/esummit/login"
                                            className="block py-4 px-6 text-center bg-gradient-to-r from-esummit-primary to-esummit-accent text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Register Now
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
