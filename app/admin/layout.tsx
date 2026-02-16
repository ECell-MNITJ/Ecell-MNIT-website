import { Toaster } from 'react-hot-toast';
import AdminSidebar from '@/components/admin/Sidebar';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
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
            redirect('/unauthorized?source=ecell');
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <main className="flex-1 ml-64">
                <div className="p-8">
                    {children}
                </div>
            </main>
            <Toaster position="top-right" />
        </div>
    );
}
