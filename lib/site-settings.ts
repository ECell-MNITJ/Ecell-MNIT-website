import { Database } from '@/lib/supabase/types';
import { SupabaseClient } from '@supabase/supabase-js';

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

export async function getSiteSettings(supabase: SupabaseClient<Database>): Promise<SiteSettings> {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) {
            // PGRST116: JSON object returned on .single() when no rows found
            if (error.code === 'PGRST116') {
                console.warn('Site settings not found (id=1), using defaults.');
                return DEFAULT_SETTINGS;
            }

            console.error('Error fetching site settings:', JSON.stringify(error, null, 2));
            console.error('Supabase URL defined:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);

            // Return defaults if table doesn't exist or other error
            return DEFAULT_SETTINGS;
        }

        return data;
    } catch (error) {
        console.error('Unexpected error fetching site settings:', error);
        return DEFAULT_SETTINGS;
    }
}

export async function updateSiteSettings(supabase: SupabaseClient<Database>, settings: SiteSettingsUpdate): Promise<{ success: boolean; error?: any }> {
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
