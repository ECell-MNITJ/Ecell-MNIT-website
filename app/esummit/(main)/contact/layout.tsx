import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Get in touch with the team behind E-Summit 2026 at NIT Jaipur.',
    openGraph: {
        title: "Contact | E-Summit '26",
        description: "Get in touch with the team behind E-Summit 2026 at NIT Jaipur.",
        url: "/esummit/contact",
    }
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
