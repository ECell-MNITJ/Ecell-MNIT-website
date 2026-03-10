
import { createBrowserClient } from '@supabase/ssr';
import { Database } from './types';

export type { Database };

export interface AgendaItem {
    id: string;
    time: string;
    title: string;
    description: string;
}

export interface Speaker {
    id: string;
    name: string;
    role: string;
    company: string;
    bio: string;
    image_url: string | null;
    linkedin_url?: string;
    twitter_url?: string;
}

export interface GalleryImage {
    id: string;
    url: string;
    caption?: string;
}

export interface FAQItem {
    question: string;
    answer: string;
}

export interface CustomSectionItem {
    id: string;
    name: string;
    role: string;
    company: string;
    bio: string;
    image_url: string | null;
    linkedin_url?: string;
}

export interface CustomSection {
    id: string;
    title: string;
    items: CustomSectionItem[];
}

export interface EventDetails {
    agenda?: AgendaItem[];
    speakers?: Speaker[];
    gallery?: GalleryImage[];
    faq?: FAQItem[];
    custom_sections?: CustomSection[];
}

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

// Create a single supabase client for interacting with your database
export const createClient = () => {
    if (browserClient) return browserClient;

    browserClient = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    return browserClient;
};
