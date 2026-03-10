import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';
import PassesList from '@/components/esummit/admin/PassesList';

export const revalidate = 0;

export default async function PassesAdminPage() {
    const supabase = await createServerClient();

    const { data: passes, error } = await supabase
        .from('esummit_passes')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching passes:', error);
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Event Passes</h1>
                    <p className="text-gray-400">Manage passes that users can purchase for E-Summit.</p>
                </div>
                <Link
                    href="/esummit/admin/passes/new"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors flex items-center gap-2"
                >
                    <FiPlus /> Create Pass
                </Link>
            </div>

            <PassesList initialPasses={passes || []} />
        </div>
    );
}
