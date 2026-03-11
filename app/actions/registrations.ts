'use server';

import { createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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
    const supabase = createAdminClient();

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
    const supabase = createAdminClient();

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

export async function deleteRegistration(registrationId: string) {
    const supabase = await createServerClient();

    try {
        const { error } = await supabase
            .from('event_registrations')
            .delete()
            .eq('id', registrationId);

        if (error) throw error;

        revalidatePath('/esummit/admin/registrations');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting registration:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteProfile(profileId: string) {
    const supabase = createAdminClient();

    try {
        // 1. Delete from Auth (this also cascades to profiles if set up, but we'll be explicit)
        const { error: authError } = await supabase.auth.admin.deleteUser(profileId);
        if (authError) throw authError;

        // 2. Profile deletion should happen via cascade, but ensure revalidation
        revalidatePath('/esummit/admin/participants');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting profile:', error);
        return { success: false, error: error.message };
    }
}

export async function promoteToCA(profileId: string, fullName: string, college?: string) {
    const supabase = createAdminClient();

    try {
        // Generate a unique referral code: 'CA' + First 3 letters of name + 4 random digits
        const namePrefix = fullName ? fullName.substring(0, 3).toUpperCase() : 'USER';
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const referralCode = `CA${namePrefix}${randomDigits}`;

        const { error } = await supabase
            .from('campus_ambassadors')
            .insert({
                profile_id: profileId,
                referral_code: referralCode,
                college: college || 'Not Specified',
                is_active: true
            });

        if (error) {
            if (error.code === '23505') { // Unique violation
                // Simple one-time retry
                const retryDigits = Math.floor(1000 + Math.random() * 9000);
                const retryCode = `CA${namePrefix}${retryDigits}`;
                const { error: retryError } = await supabase
                    .from('campus_ambassadors')
                    .insert({
                        profile_id: profileId,
                        referral_code: retryCode,
                        college: college || 'Not Specified',
                        is_active: true
                    });
                if (retryError) throw retryError;
            } else {
                throw error;
            }
        }

        revalidatePath('/esummit/admin/participants');
        return { success: true, referralCode };
    } catch (error: any) {
        console.error('Error promoting to CA:', error);
        return { success: false, error: error.message };
    }
}
