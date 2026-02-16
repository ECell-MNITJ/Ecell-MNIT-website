import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ESummitUserProfile from '@/components/esummit/UserProfile';

export default async function ESummitProfilePage() {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?next=/esummit/profile');
    }

    return (
        <div className="bg-esummit-bg min-h-screen text-white selection:bg-esummit-primary selection:text-white">
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-esummit-primary/10 via-esummit-bg to-esummit-bg"></div>
                {/* Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-esummit-accent/5 rounded-full blur-[100px]" />

                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-4xl md:text-5xl font-black mb-10 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-esummit-accent drop-shadow-[0_0_10px_rgba(157,78,221,0.3)]">
                        My E-Summit Profile
                    </h1>

                    <ESummitUserProfile user={user} />
                </div>
            </section>
        </div>
    );
}
