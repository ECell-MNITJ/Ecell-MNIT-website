import { MetadataRoute } from 'next';
import { createServerClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecellmnit.org';

    // Static Routes for E-Summit
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/esummit`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/esummit/vision`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/esummit/events`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/esummit/gallery`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/esummit/contact`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
    ];

    // Dynamic Routes for E-Summit Events
    const supabase = await createServerClient();

    // Fetch all E-Summit events
    const { data: events } = await supabase
        .from('events')
        .select('id, created_at')
        .eq('is_esummit', true);

    const eventRoutes: MetadataRoute.Sitemap = (events || []).map((event) => ({
        url: `${baseUrl}/esummit/events/${event.id}`,
        lastModified: event.created_at ? new Date(event.created_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    return [...staticRoutes, ...eventRoutes];
}
