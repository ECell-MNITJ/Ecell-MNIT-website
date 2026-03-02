import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Our Vision',
    description: 'Learn about the vision and mission driving E-Summit 2026 at NIT Jaipur.',
    openGraph: {
        title: "Vision | E-Summit '26",
        description: "Learn about the vision and mission driving E-Summit 2026 at NIT Jaipur.",
        url: "/esummit/vision",
    }
};

export default function VisionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
