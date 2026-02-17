import EsNavbar from '@/components/esummit/Navbar';
import EsFooter from '@/components/esummit/Footer';
import MainPaddingWrapper from '@/components/esummit/MainPaddingWrapper';
import { createServerClient } from '@/lib/supabase/server';
import ProfileEnforcer from '@/components/esummit/ProfileEnforcer';

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
