'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FiUser } from 'react-icons/fi';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const pathname = usePathname();
    const supabase = createClient();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
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
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'Events', href: '/events' },
        { name: 'Startups', href: '/startups' },
        { name: 'Gallery', href: '/gallery' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 px-4 pt-4">
            <div
                className={`mx-auto max-w-7xl rounded-2xl transition-all duration-300 ${isScrolled || isMenuOpen
                    ? 'bg-primary-green/90 backdrop-blur-xl shadow-2xl border border-white/10'
                    : 'bg-primary-green/60 backdrop-blur-lg shadow-xl border border-white/5'
                    }`}
            >
                <div className="px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link href="/" className="text-2xl font-heading text-white tracking-wider">
                            E-CELL <span className="text-primary-golden">MNIT</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <ul className="hidden md:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className={`text-white font-medium relative py-2 transition-colors hover:text-primary-golden ${pathname === link.href ? 'text-primary-golden' : ''
                                            }`}
                                    >
                                        {link.name}
                                        <span
                                            className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary-golden transition-all duration-300 ${pathname === link.href ? 'w-4/5' : 'w-0 group-hover:w-4/5'
                                                }`}
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* Auth Buttons (Desktop) */}
                        <div className="hidden md:flex items-center ml-8">
                            {user ? (
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 bg-primary-golden text-white px-5 py-2 rounded-full font-medium hover:bg-white hover:text-primary-golden transition-all duration-300"
                                >
                                    <FiUser />
                                    Profile
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="text-white font-medium hover:text-primary-golden transition-colors"
                                >
                                    Login
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden flex flex-col gap-1.5 p-2"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span
                                className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''
                                    }`}
                            />
                            <span
                                className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''
                                    }`}
                            />
                            <span
                                className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    <div
                        className={`md:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96' : 'max-h-0'
                            }`}
                    >
                        <ul className="py-4 space-y-2">
                            {navLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className={`block py-3 px-4 text-white font-medium rounded-lg transition-colors ${pathname === link.href
                                            ? 'bg-primary-golden/20 text-primary-golden'
                                            : 'hover:bg-white/10'
                                            }`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                            {/* Mobile Auth Buttons */}
                            <li className="pt-4 mt-4 border-t border-white/10">
                                {user ? (
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-2 py-3 px-4 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <FiUser className="text-primary-golden" />
                                        Profile
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="block py-3 px-4 text-center bg-primary-golden text-white font-medium rounded-lg hover:bg-white hover:text-primary-golden transition-all duration-300"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
}
