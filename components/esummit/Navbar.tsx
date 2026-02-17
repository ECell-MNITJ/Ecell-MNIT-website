'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
            let adminRole = false;
            let memberRole = false;

            // Check profile role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

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
            className="fixed top-0 left-0 w-full z-50 px-4 pt-4 md:pt-6"
        >
            <motion.div
                animate={{
                    borderRadius: isMenuOpen ? 24 : 50,
                }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="mx-auto max-w-7xl bg-esummit-card/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-esummit-primary/20 py-3 md:py-4 px-6"
            >
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/esummit" className="group">
                        <span className="text-2xl font-black text-white tracking-wider flex items-center gap-2 group-hover:scale-105 transition-transform duration-300">
                            E-SUMMIT <span className="text-esummit-primary drop-shadow-[0_0_10px_rgba(157,78,221,0.8)]">26</span>
                        </span>
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
                        className="md:hidden flex flex-col gap-1.5 p-2 z-50"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <motion.span
                            animate={isMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                            className="w-8 h-0.5 bg-white origin-center"
                        />
                        <motion.span
                            animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                            className="w-8 h-0.5 bg-white"
                        />
                        <motion.span
                            animate={isMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                            className="w-8 h-0.5 bg-white origin-center"
                        />
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
                            className="md:hidden overflow-y-auto max-h-[85vh]"
                        >
                            <ul className="flex flex-col gap-2 pt-6 pb-2">
                                {navLinks.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className={`block py-3 px-4 text-center font-bold uppercase tracking-wider rounded-xl transition-all ${pathname === link.href
                                                ? 'bg-esummit-primary text-white'
                                                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                                                }`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                                <li className="pt-2 flex flex-col gap-2">
                                    {(isAdmin || isMember) && (
                                        <Link
                                            href="/esummit/scan"
                                            className="block py-3 px-4 text-center border border-white/10 text-gray-300 font-bold uppercase tracking-wider rounded-xl hover:bg-white/10 hover:text-white transition-all"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Scanner
                                        </Link>
                                    )}
                                    {isAdmin && (
                                        <Link
                                            href="/esummit/admin"
                                            className="block py-3 px-4 text-center border border-esummit-primary/50 text-esummit-primary font-bold uppercase tracking-wider rounded-xl hover:bg-esummit-primary/10 transition-all"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Admin Panel
                                        </Link>
                                    )}
                                    {user ? (
                                        <Link
                                            href="/esummit/profile"
                                            className="flex items-center justify-center gap-2 py-3 px-4 bg-esummit-bg border border-esummit-primary text-esummit-primary font-bold uppercase tracking-wider rounded-xl"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <FiUser />
                                            Profile
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/esummit/login"
                                            className="block py-3 px-4 text-center bg-white text-black font-bold uppercase tracking-wider rounded-xl hover:bg-gray-200"
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
