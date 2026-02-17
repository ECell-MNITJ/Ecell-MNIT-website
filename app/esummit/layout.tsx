import { Metadata } from 'next';
import BackgroundCanvas from '@/components/esummit/BackgroundCanvas';

export const metadata: Metadata = {
    title: 'E-Summit MNIT Jaipur',
    description: 'E-Summit 2026 by E-Cell MNIT. Where ideas take flight and innovation knows no bounds.',
};

export default function ESummitLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <BackgroundCanvas />
            {children}
        </>
    );
}
