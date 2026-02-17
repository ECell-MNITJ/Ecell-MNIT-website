import BackgroundCanvas from '@/components/esummit/BackgroundCanvas';

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
