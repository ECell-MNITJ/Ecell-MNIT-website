'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiCalendar, FiUsers, FiSettings, FiLogOut, FiImage } from 'react-icons/fi';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ESummitAdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const isActive = (path: string) => pathname?.startsWith(path);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        // Clear the verification cookie
        document.cookie = 'esummit-admin-verified=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        router.push('/esummit/admin/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/esummit/admin/dashboard', icon: FiHome },
        { name: 'E-Summit Events', path: '/esummit/admin/events', icon: FiCalendar },
        { name: 'Registrations', path: '/esummit/admin/registrations', icon: FiUsers },
        { name: 'Gallery', path: '/esummit/admin/gallery', icon: FiCalendar }, // Using FiCalendar as placeholder or import FiImage
        { name: 'Landing Page', path: '/esummit/admin/landing', icon: FiSettings },
        { name: 'Live Attendance', path: '/esummit/admin/attendance', icon: FiUsers },
        { name: 'Queries', path: '/esummit/admin/queries', icon: FiUsers },
        { name: 'Settings', path: '/esummit/admin/settings', icon: FiSettings },
    ];

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                className="md:hidden fixed top-4 right-4 z-50 bg-gray-900 text-white p-2 rounded-lg border border-gray-800 shadow-lg"
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

            <aside className={`w-64 bg-gray-900 min-h-screen text-white flex flex-col fixed left-0 top-0 bottom-0 z-50 overflow-y-auto transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <div>
                        <Link href="/esummit" className="flex items-center gap-2 mb-1">
                            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                                E-SUMMIT
                            </span>
                        </Link>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Admin Panel</div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(item.path)
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-white' : ''}`} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <FiLogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
