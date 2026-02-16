'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { FiUsers, FiCalendar, FiTrendingUp, FiPlus, FiImage } from 'react-icons/fi';

interface DashboardStats {
    totalTeamMembers: number;
    totalEvents: number;
    upcomingEvents: number;
    totalGalleryImages: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalTeamMembers: 0,
        totalEvents: 0,
        upcomingEvents: 0,
        totalGalleryImages: 0,
    });
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Get team members count
            const { count: teamCount } = await supabase
                .from('team_members')
                .select('*', { count: 'exact', head: true });

            // Get total events count
            const { count: eventsCount } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true });

            // Get upcoming events count
            const { count: upcomingCount } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'upcoming');

            // Get gallery images count
            const { count: galleryCount } = await supabase
                .from('gallery_images')
                .select('*', { count: 'exact', head: true });

            setStats({
                totalTeamMembers: teamCount || 0,
                totalEvents: eventsCount || 0,
                upcomingEvents: upcomingCount || 0,
                totalGalleryImages: galleryCount || 0,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Team Members',
            value: stats.totalTeamMembers,
            icon: FiUsers,
            color: 'bg-blue-500',
            link: '/admin/team',
        },
        {
            title: 'Total Events',
            value: stats.totalEvents,
            icon: FiCalendar,
            color: 'bg-green-500',
            link: '/admin/events',
        },
        {
            title: 'Upcoming Events',
            value: stats.upcomingEvents,
            icon: FiTrendingUp,
            color: 'bg-primary-golden',
            link: '/admin/events',
        },
        {
            title: 'Gallery Images',
            value: stats.totalGalleryImages,
            icon: FiImage,
            color: 'bg-purple-500',
            link: '/admin/gallery',
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-heading text-primary-green mb-2">
                    Welcome to Admin Dashboard
                </h1>
                <p className="text-gray-600">Manage your E-Cell website content</p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Link
                            key={card.title}
                            href={card.link}
                            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${card.color} p-3 rounded-lg`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
                            <p className="text-3xl font-bold text-primary-green">
                                {loading ? '...' : card.value}
                            </p>
                        </Link>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-heading text-primary-green mb-4">Quick Actions</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Link
                        href="/admin/team"
                        className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-golden hover:bg-primary-golden/5 transition-all"
                    >
                        <FiPlus className="w-5 h-5 text-primary-golden" />
                        <span className="font-medium text-gray-700">Add Team Member</span>
                    </Link>
                    <Link
                        href="/admin/events"
                        className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-golden hover:bg-primary-golden/5 transition-all"
                    >
                        <FiPlus className="w-5 h-5 text-primary-golden" />
                        <span className="font-medium text-gray-700">Add Event</span>
                    </Link>
                    <Link
                        href="/admin/gallery"
                        className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-golden hover:bg-primary-golden/5 transition-all"
                    >
                        <FiPlus className="w-5 h-5 text-primary-golden" />
                        <span className="font-medium text-gray-700">Add Gallery Image</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
