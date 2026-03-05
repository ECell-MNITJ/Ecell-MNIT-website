import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Incubated Startups | E-Cell MNIT Jaipur',
    description: 'Explore the innovative startups incubated by the Entrepreneurship Cell at MNIT Jaipur. From tech solutions to sustainable ideas.',
    keywords: ['Startups MNIT Jaipur', 'Incubated Startups', 'E-Cell Startups', 'Entrepreneurship Cell Ventures'],
};

export default function StartupsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
