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

    // 3. Delete Data Manually (Cascade)

    // A. Delete Teams created by user (if any)
    // First, find teams created by user
    const { data: userTeams } = await adminSupabase
        .from('teams')
        .select('id')
        .eq('created_by', user.id);

    if (userTeams && userTeams.length > 0) {
        // Delete participants of these teams (cascade usually handles this, but let's be safe)
        // ... valid point, but if we delete team, team_members/registrations should cascade if DB is set up right.
        // If not, we might need to verify. Assuming basic cascade for now or that we delete the team row.

        const teamIds = userTeams.map(t => t.id);
        const { error: teamError } = await adminSupabase
            .from('teams')
            .delete()
            .in('id', teamIds);

        if (teamError) {
            console.error('Error deleting user teams:', teamError);
            // This might block user deletion if created_by is FK
        }
    }

    // B. Delete event registrations
    const { error: regError } = await adminSupabase
        .from('event_registrations')
        .delete()
        .eq('user_id', user.id);

    if (regError) {
        console.error('Error deleting registrations:', regError);
        throw new Error(`Failed to delete registrations: ${regError.message}`);
    }

    // C. Delete profile
    const { error: profileError } = await adminSupabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

    if (profileError) {
        console.error('Error deleting profile:', profileError);
        // If this fails, deleteUser will likely fail too
        throw new Error(`Failed to delete profile: ${profileError.message}`);
    }

    // 4. Delete Auth User
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
        console.error('Error deleting user:', deleteError);
        throw new Error(`Failed to delete account: ${deleteError.message}`);
    }

    // 5. Redirect
    redirect('/login');
}
