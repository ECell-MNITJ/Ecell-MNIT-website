import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Gallery',
    description: 'Explore the memories and highlights from previous editions of E-Summit at NIT Jaipur.',
    openGraph: {
        title: "Gallery | E-Summit '26",
        description: "Explore the memories and highlights from previous editions of E-Summit at NIT Jaipur.",
        url: "/esummit/gallery",
    }
};

export default function GalleryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
