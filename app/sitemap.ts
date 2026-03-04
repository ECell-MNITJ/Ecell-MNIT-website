import { MetadataRoute } from 'next';
import { createServerClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecellmnit.org';

    // Static Routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/events`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/startups`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/gallery`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
    ];

    // Dynamic Routes for Events
    const supabase = await createServerClient();

    // Fetch all events (we will include both main and e-summit events for complete coverage here if needed, 
    // or specifically filter out esummit events if you want strict separation. 
    // Usually main sitemap has all main events. Here we fetch events that aren't strictly esummit-only or all.)
    const { data: events } = await supabase
        .from('events')
        .select('id, created_at')
        .eq('is_esummit', false);

    const eventRoutes: MetadataRoute.Sitemap = (events || []).map((event) => ({
        url: `${baseUrl}/events/${event.id}`,
        lastModified: event.created_at ? new Date(event.created_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    // Fetch Startups
    const { data: startups } = await supabase
        .from('startups')
        .select('id, created_at, status')
        .eq('status', 'active');

    const startupRoutes: MetadataRoute.Sitemap = (startups || []).map((startup) => ({
        url: `${baseUrl}/startups/${startup.id}`,
        lastModified: startup.created_at ? new Date(startup.created_at) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    return [...staticRoutes, ...eventRoutes, ...startupRoutes];
}
