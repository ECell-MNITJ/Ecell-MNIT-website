import Link from 'next/link';
import { Suspense } from 'react';
import { createServerClient } from '@/lib/supabase/server';
import { FiCalendar, FiMapPin } from 'react-icons/fi';
import StartupMarquee from '@/components/StartupMarquee';
import ScrollSceneWrapper from '@/components/3d/ScrollSceneWrapper';

export const revalidate = 0; // Ensure fresh data

export default async function Home() {
    const supabase = await createServerClient();

    // Fetch events (we'll fetch a bit more to handle the sorting in JS for now)
    const { data: allEvents } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true }); // Get sorted by date initially

    // Custom sorting logic: Upcoming > Ongoing > Past
    // For Upcoming/Ongoing: Soonest first (Ascending) - already handled by DB order mostly
    // For Past: Most recent first (Descending)

    const upcoming = (allEvents || []).filter(e => e.status === 'upcoming');
    const ongoing = (allEvents || []).filter(e => e.status === 'ongoing');
    const past = (allEvents || []).filter(e => e.status === 'past').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Combine: Upcoming -> Ongoing -> Past
    // Limit to 3
    const displayEvents = [...upcoming, ...ongoing, ...past].slice(0, 3);

    // Fetch startups
    const { data: startups } = await supabase
        .from('startups')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });

    // Fetch impact metrics
    const { data: stats } = await supabase
        .from('impact_metrics')
        .select('*')
        .order('display_order', { ascending: true });


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <main className="w-full h-screen overflow-hidden">
            <Suspense fallback={<div className="w-full h-full bg-black/20" />}>
                <ScrollSceneWrapper events={displayEvents} startups={startups || []} stats={stats || []} />
            </Suspense>
        </main>
    );
}
