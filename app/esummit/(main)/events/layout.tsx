import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Events',
    description: 'Discover the exciting lineup of events, competitions, and hackathons at E-Summit 2026.',
    openGraph: {
        title: "Events | E-Summit '26",
        description: "Discover the exciting lineup of events, competitions, and hackathons at E-Summit 2026.",
        url: "/esummit/events",
    }
};

export default function EventsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
