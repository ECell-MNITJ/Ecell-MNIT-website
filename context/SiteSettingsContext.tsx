'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings, DEFAULT_SETTINGS, getSiteSettings } from '@/lib/site-settings';
import { createClient } from '@/lib/supabase/client';

interface SiteSettingsContextType {
    settings: SiteSettings;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
    settings: DEFAULT_SETTINGS,
    loading: false,
    refreshSettings: async () => { },
});

export const useSiteSettings = () => useContext(SiteSettingsContext);

export function SiteSettingsProvider({
    children,
    initialSettings = DEFAULT_SETTINGS
}: {
    children: React.ReactNode;
    initialSettings?: SiteSettings;
}) {
    const [settings, setSettings] = useState<SiteSettings>(initialSettings);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    // If initialSettings are default, try to fetch on mount
    useEffect(() => {
        if (initialSettings === DEFAULT_SETTINGS) {
            refreshSettings();
        }
    }, []);

    const refreshSettings = async () => {
        setLoading(true);
        try {
            const newSettings = await getSiteSettings(supabase);
            setSettings(newSettings);
        } catch (error) {
            console.error('Failed to refresh settings:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
            {children}
        </SiteSettingsContext.Provider>
    );
}
