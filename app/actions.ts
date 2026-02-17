'use server';

import { createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export async function deleteAccount() {
    // 1. Validate session
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error('Unauthorized');
    }

    // 2. Initialize Admin Client
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
        throw new Error('Server misconfiguration: Missing Service Role Key');
    }

    const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    // 3. Delete User
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
        console.error('Error deleting user:', deleteError);
        throw new Error('Failed to delete account');
    }

    // 4. Redirect
    redirect('/');
}
