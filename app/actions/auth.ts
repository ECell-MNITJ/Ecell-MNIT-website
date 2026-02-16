'use server';

import { createServerClient as createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

type LoginResult = {
    success: boolean;
    error?: string;
    redirectUrl?: string;
};

export async function loginAction(formData: FormData, type: 'admin' | 'esummit'): Promise<LoginResult> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
    }

    const supabase = await createClient();
    const cookieStore = await cookies();

    try {
        // 1. Check Whitelist
        const { data: isAdmin, error: whitelistError } = await supabase.rpc('check_admin_access', {
            check_email: email,
        });

        if (whitelistError) {
            console.error('Whitelist check failed:', whitelistError);
            return { success: false, error: 'Authentication failed' };
        }

        if (!isAdmin) {
            return { success: false, error: 'Unauthorized access' };
        }

        // 2. Check Lockout
        const { data: lockoutStatus, error: lockoutError } = await supabase.rpc('check_lockout_status', {
            check_email: email,
        });

        if (lockoutError) {
            console.error('Lockout check failed:', lockoutError);
            return { success: false, error: 'Authentication check failed' };
        }

        if (lockoutStatus && (lockoutStatus as any).locked_until) {
            const lockedUntil = new Date((lockoutStatus as any).locked_until);
            if (lockedUntil > new Date()) {
                const remainingMinutes = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
                return {
                    success: false,
                    error: `Account locked. Please try again in ${remainingMinutes} minutes.`
                };
            }
        }

        // 3. Attempt Login
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        // 4. Log Attempt
        await supabase.rpc('log_login_attempt', {
            check_email: email,
            is_success: !signInError,
        });

        if (signInError) {
            return { success: false, error: 'Invalid email or password' };
        }

        // 5. Success
        if (type === 'admin') {
            cookieStore.set('admin-verified', 'true', { path: '/', httpOnly: true, secure: true, maxAge: 60 * 60 * 24 });
            return { success: true, redirectUrl: '/admin/dashboard' };
        } else {
            cookieStore.set('esummit-admin-verified', 'true', { path: '/', httpOnly: true, secure: true, maxAge: 60 * 60 * 24 });
            return { success: true, redirectUrl: '/esummit/admin/dashboard' };
        }

    } catch (error) {
        console.error('Login action error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}
