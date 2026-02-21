'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteESummitEvent(eventId: string) {
    const supabase = await createServerClient();

    try {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', eventId)
            .eq('is_esummit', true); // Security check to only delete E-Summit events

        if (error) throw error;

        revalidatePath('/esummit/admin/events');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting event:', error);
        return { success: false, error: error.message };
    }
}

export async function toggleRegistrationStatus(eventId: string, currentStatus: boolean) {
    const supabase = await createServerClient();

    try {
        const { error } = await supabase
            .from('events')
            .update({ registrations_open: !currentStatus })
            .eq('id', eventId)
            .eq('is_esummit', true);

        if (error) throw error;

        revalidatePath('/esummit/admin/events');
        return { success: true };
    } catch (error: any) {
        console.error('Error toggling registration status:', error);
        return { success: false, error: error.message };
    }
}
