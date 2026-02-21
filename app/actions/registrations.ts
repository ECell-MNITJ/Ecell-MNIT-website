'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateAttendanceStatus(registrationId: string, currentStatus: boolean) {
    const supabase = await createServerClient();

    try {
        const { error } = await supabase
            .from('event_registrations')
            .update({
                checked_in: !currentStatus,
                checked_in_at: !currentStatus ? new Date().toISOString() : null
            })
            .eq('id', registrationId);

        if (error) throw error;

        revalidatePath('/esummit/admin/registrations');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating attendance status:', error);
        return { success: false, error: error.message };
    }
}

export async function updateRegistrationRole(registrationId: string, newRole: string) {
    const supabase = await createServerClient();

    try {
        const { error } = await supabase
            .from('event_registrations')
            .update({ role: newRole })
            .eq('id', registrationId);

        if (error) throw error;

        revalidatePath('/esummit/admin/registrations');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating registration role:', error);
        return { success: false, error: error.message };
    }
}

export async function updateProfileRole(profileId: string, newRole: string) {
    const supabase = await createServerClient();

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', profileId);

        if (error) throw error;

        revalidatePath('/esummit/admin/participants');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating profile role:', error);
        return { success: false, error: error.message };
    }
}
