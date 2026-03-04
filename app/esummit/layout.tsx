import { Metadata } from 'next';
import BackgroundCanvas from '@/components/esummit/BackgroundCanvas';

export const metadata: Metadata = {
    title: 'E-Summit MNIT Jaipur',
    description: 'E-Summit 2026 by E-Cell MNIT. Where ideas take flight and innovation knows no bounds.',
    icons: {
        icon: [
            { url: '/esummit/icon.png' },
        ],
        apple: [
            { url: '/esummit/icon.png' },
        ],
    },
};

import StructuredData, { getBreadcrumbSchema, getNavigationSchema } from "@/components/SEO/StructuredData";

export default function ESummitLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const baseUrl = 'https://www.ecellmnit.org';
    const esummitBreadcrumbs = getBreadcrumbSchema(baseUrl, [
        { name: 'Home', item: '/' },
        { name: 'E-Summit', item: '/esummit' },
    ]);
    const esummitNavigation = getNavigationSchema(baseUrl, [
        { name: 'E-Summit 2026', url: '/esummit' },
        { name: 'Events', url: '/esummit/events' },
        { name: 'Vision', url: '/esummit/vision' },
        { name: 'Gallery', url: '/esummit/gallery' },
        { name: 'Team', url: '/esummit/team' },
        { name: 'Contact', url: '/esummit/contact' },
    ]);

    return (
        <>
            <StructuredData data={esummitBreadcrumbs} />
            <StructuredData data={esummitNavigation} />
            <BackgroundCanvas />
            {children}
        </>
    );
}
