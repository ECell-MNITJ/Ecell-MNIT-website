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

export async function reorderESummitEvent(eventId: string, currentOrder: number, direction: 'up' | 'down') {
    const supabase = await createServerClient();

    try {
        // Find the event to swap with
        const { data: siblingData, error: siblingError } = await supabase
            .from('events')
            .select('id, display_order')
            .eq('is_esummit', true)
            .order('display_order', { ascending: direction === 'up' ? false : true })
            .filter('display_order', direction === 'up' ? 'lt' : 'gt', currentOrder)
            .limit(1)
            .single();

        if (siblingError && siblingError.code !== 'PGRST116') {
            throw siblingError;
        }

        if (siblingData) {
            // Swap display orders
            const { error: error1 } = await supabase
                .from('events')
                .update({ display_order: siblingData.display_order })
                .eq('id', eventId);

            if (error1) throw error1;

            const { error: error2 } = await supabase
                .from('events')
                .update({ display_order: currentOrder })
                .eq('id', siblingData.id);

            if (error2) throw error2;

            revalidatePath('/esummit/admin/events');
            revalidatePath('/esummit/events');
            return { success: true };
        } else {
            return { success: false, error: 'Cannot move further in this direction' };
        }
    } catch (error: any) {
        console.error('Error reordering event:', error);
        return { success: false, error: error.message };
    }
}
