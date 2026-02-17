'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { FiHome, FiUsers, FiCalendar, FiLogOut, FiTrendingUp, FiImage, FiSettings } from 'react-icons/fi';

import { useState } from 'react';

export default function AdminSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            toast.success('Logged out successfully');
            router.push('/admin/login');
            router.refresh();
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: FiHome },
        { name: 'Team Members', href: '/admin/team', icon: FiUsers },
        { name: 'Events', href: '/admin/events', icon: FiCalendar },
        { name: 'Registrations', href: '/admin/registrations', icon: FiUsers },
        { name: 'Startups', href: '/admin/startups', icon: FiTrendingUp },
        { name: 'Gallery', href: '/admin/gallery', icon: FiImage },
        { name: 'Impact / Stats', href: '/admin/impact', icon: FiTrendingUp },
        { name: 'Queries', href: '/admin/queries', icon: FiUsers },
        { name: 'Settings', href: '/admin/settings', icon: FiSettings },
    ];

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                className="md:hidden fixed top-4 right-4 z-50 bg-primary-green text-white p-2 rounded-lg border border-white/10 shadow-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <FiLogOut className="w-6 h-6 rotate-180" /> : <FiHome className="w-6 h-6" />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`w-64 bg-primary-green min-h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <Link href="/admin/dashboard" className="text-2xl font-heading text-white">
                        E-CELL <span className="text-primary-golden">ADMIN</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                            ? 'bg-primary-golden text-white'
                                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-white/10 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-white/70 hover:bg-red-500/20 hover:text-red-500 transition-all"
                    >
                        <FiLogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>

                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 mt-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Website
                    </Link>
                </div>
            </div>
        </>
    );
}
