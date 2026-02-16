
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

export interface EventDetails {
    agenda?: AgendaItem[];
    speakers?: Speaker[];
    gallery?: GalleryImage[];
    faq?: FAQItem[];
}

// Create a single supabase client for interacting with your database
export const createClient = () =>
    createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
