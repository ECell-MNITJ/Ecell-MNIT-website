import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/types';

export type SiteSettings = Database['public']['Tables']['site_settings']['Row'];
export type SiteSettingsUpdate = Database['public']['Tables']['site_settings']['Update'];

// Constants for default values
export const DEFAULT_SETTINGS: SiteSettings = {
    id: 1,
    contact_email: 'ecell@mnit.ac.in',
    contact_phone: '+91 95496 57348',
    address: 'Malaviya National Institute of Technology, Jaipur, Rajasthan, India',
    facebook_url: 'https://www.facebook.com/ecellmnit/',
    twitter_url: 'https://twitter.com/ecell_mnit',
    instagram_url: 'https://www.instagram.com/ecell_mnit/',
    linkedin_url: 'https://www.linkedin.com/company/ecell-mnit-jaipur/',
    youtube_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

export async function getSiteSettings(): Promise<SiteSettings> {
    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.warn('Supabase env vars missing, returning default settings');
            return DEFAULT_SETTINGS;
        }

        const supabase = createClient();
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) {
            console.error('Error fetching site settings:', error);
            // Return defaults if table doesn't exist or other error
            return DEFAULT_SETTINGS;
        }

        return data;
    } catch (error) {
        console.error('Unexpected error fetching site settings:', error);
        return DEFAULT_SETTINGS;
    }
}

export async function updateSiteSettings(settings: SiteSettingsUpdate): Promise<{ success: boolean; error?: any }> {
    const supabase = createClient();
    try {
        const { error } = await supabase
            .from('site_settings')
            .update({
                ...settings,
                updated_at: new Date().toISOString(),
            })
            .eq('id', 1);

        if (error) {
            console.error('Error updating site settings:', error);
            return { success: false, error };
        }

        return { success: true };
    } catch (error) {
        console.error('Unexpected error updating site settings:', error);
        return { success: false, error };
    }
}
