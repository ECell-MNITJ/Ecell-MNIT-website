import EsNavbar from '@/components/esummit/Navbar';
import EsFooter from '@/components/esummit/Footer';
import MainPaddingWrapper from '@/components/esummit/MainPaddingWrapper';
import { createServerClient } from '@/lib/supabase/server';
import ProfileEnforcer from '@/components/esummit/ProfileEnforcer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: {
        template: "%s | E-Summit '26 | E-Cell MNIT",
        default: "E-Summit '26 | FIRST PRINCIPLE OF IMPACT",
    },
    description: "The flagship entrepreneurial summit of MNIT Jaipur. Join us for events, hackathons, and speaker sessions.",
    openGraph: {
        title: "E-Summit '26 | E-Cell MNIT",
        description: "The flagship entrepreneurial summit of NIT Jaipur.",
        url: "/esummit",
        siteName: 'E-Summit MNIT',
        locale: 'en_IN',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "E-Summit '26 | E-Cell MNIT",
        description: "The flagship entrepreneurial summit of NIT Jaipur.",
    }
};

export default async function ESummitMainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    return (
        <>
            <EsNavbar />
            <MainPaddingWrapper>{children}</MainPaddingWrapper>
            <ProfileEnforcer user={user} />
            <EsFooter user={user} />
        </>
    );
}
