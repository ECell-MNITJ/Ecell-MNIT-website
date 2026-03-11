import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Our Startups | E-Cell MNIT Jaipur',
    description: 'Explore the innovative startups by the Entrepreneurship Cell at MNIT Jaipur. From tech solutions to sustainable ideas.',
    keywords: ['Startups MNIT Jaipur', 'Startups', 'E-Cell Startups', 'Entrepreneurship Cell Ventures'],
};

export default function StartupsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
