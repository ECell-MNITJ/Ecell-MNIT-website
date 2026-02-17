import ESummitAdminSidebar from '@/components/esummit/AdminSidebar';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ESummitAdminProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && user.email) {
        const { data: isAdmin } = await supabase.rpc('check_admin_access', {
            check_email: user.email,
        });

        if (!isAdmin) {
            redirect('/unauthorized?source=esummit');
        }
    }

    return (
        <div className="flex min-h-screen bg-[#0a0a0a] text-gray-200">
            <ESummitAdminSidebar />
            <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen">
                {children}
            </main>
        </div>
    );
}
