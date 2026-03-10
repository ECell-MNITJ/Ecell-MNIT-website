import { createServerClient } from '@/lib/supabase/server';
import PassForm from '@/components/esummit/admin/PassForm';
import { notFound } from 'next/navigation';

export const revalidate = 0;

export default async function EditPassPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createServerClient();

    // We get id from the route URL
    const { data: pass, error } = await supabase
        .from('esummit_passes')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !pass) {
        console.error('Error fetching pass:', error);
        notFound();
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Edit Pass: {pass.name}</h1>
                <p className="text-gray-400">Modify details for this specific E-Summit pass.</p>
            </div>

            <PassForm initialData={pass} isEditing={true} />
        </div>
    );
}
