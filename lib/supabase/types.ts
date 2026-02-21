export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            team_members: {
                Row: {
                    id: string;
                    name: string;
                    role: string;
                    position: string | null;
                    email: string | null;
                    bio: string | null;
                    image_url: string | null;
                    linkedin_url: string | null;
                    twitter_url: string | null;
                    order_index: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    role: string;
                    email?: string | null;
                    bio?: string | null;
                    image_url?: string | null;
                    linkedin_url?: string | null;
                    twitter_url?: string | null;
                    order_index?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    role?: string;
                    position?: string | null;
                    email?: string | null;
                    bio?: string | null;
                    image_url?: string | null;
                    linkedin_url?: string | null;
                    twitter_url?: string | null;
                    order_index?: number;
                    created_at?: string;
                };
                Relationships: [];
            };
            events: {
                Row: {
                    id: string;
                    title: string;
                    description: string;
                    detailed_description: string | null;
                    event_details: Json | null;
                    date: string;
                    category: string;
                    location: string | null;
                    image_url: string | null;
                    registration_link: string | null;
                    details_url: string | null;
                    status: 'upcoming' | 'ongoing' | 'past';
                    featured: boolean;
                    created_at: string;
                    is_team_event: boolean;
                    min_team_size: number;
                    max_team_size: number;
                    is_esummit: boolean;
                    registrations_open: boolean;
                };
                Insert: {
                    id?: string;
                    title: string;
                    description: string;
                    detailed_description?: string | null;
                    event_details?: Json | null;
                    date: string;
                    category: string;
                    location?: string | null;
                    image_url?: string | null;
                    registration_link?: string | null;
                    details_url?: string | null;
                    status?: 'upcoming' | 'ongoing' | 'past';
                    featured?: boolean;
                    created_at?: string;
                    is_team_event?: boolean;
                    min_team_size?: number;
                    max_team_size?: number;
                    is_esummit?: boolean;
                    registrations_open?: boolean;
                };
                Update: {
                    id?: string;
                    title?: string;
                    description?: string;
                    detailed_description?: string | null;
                    event_details?: Json | null;
                    date?: string;
                    category?: string;
                    location?: string | null;
                    image_url?: string | null;
                    registration_link?: string | null;
                    details_url?: string | null;
                    status?: 'upcoming' | 'ongoing' | 'past';
                    featured?: boolean;
                    created_at?: string;
                    is_team_event?: boolean;
                    min_team_size?: number;
                    max_team_size?: number;
                    is_esummit?: boolean;
                    registrations_open?: boolean;
                };
                Relationships: [];
            };
            gallery_images: {
                Row: {
                    id: string;
                    image_url: string;
                    caption: string | null;
                    category: 'ecell' | 'esummit';
                    section_id: string | null;
                    collection_id: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    image_url: string;
                    caption?: string | null;
                    category: 'ecell' | 'esummit';
                    section_id?: string | null;
                    collection_id?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    image_url?: string;
                    caption?: string | null;
                    category?: 'ecell' | 'esummit';
                    section_id?: string | null;
                    collection_id?: string | null;
                    created_at?: string;
                };
                Relationships: [];
            };
            gallery_collections: {
                Row: {
                    id: string;
                    title: string;
                    description: string | null;
                    date: string;
                    cover_image_url: string | null;
                    section_id: string | null;
                    category: 'ecell' | 'esummit';
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    description?: string | null;
                    date?: string;
                    cover_image_url?: string | null;
                    section_id?: string | null;
                    category: 'ecell' | 'esummit';
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    description?: string | null;
                    date?: string;
                    cover_image_url?: string | null;
                    section_id?: string | null;
                    category?: 'ecell' | 'esummit';
                    created_at?: string;
                };
                Relationships: [];
            };
            gallery_sections: {
                Row: {
                    id: string;
                    title: string;
                    source: 'ecell' | 'esummit';
                    display_order: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    source: 'ecell' | 'esummit';
                    display_order?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    source?: 'ecell' | 'esummit';
                    display_order?: number;
                    created_at?: string;
                };
                Relationships: [];
            };
            event_registrations: {
                Row: {
                    id: string;
                    user_id: string;
                    event_id: string;
                    created_at: string;
                    team_id: string | null;
                    role: string;
                    checked_in: boolean;
                    checked_in_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    event_id: string;
                    created_at?: string;
                    team_id?: string | null;
                    role?: string;
                    checked_in?: boolean;
                    checked_in_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    event_id?: string;
                    created_at?: string;
                    team_id?: string | null;
                    role?: string;
                    checked_in?: boolean;
                    checked_in_at?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "event_registrations_event_id_fkey";
                        columns: ["event_id"];
                        referencedRelation: "events";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "event_registrations_team_id_fkey";
                        columns: ["team_id"];
                        referencedRelation: "teams";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "event_registrations_profiles_id_fkey";
                        columns: ["user_id"];
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            teams: {
                Row: {
                    id: string;
                    event_id: string;
                    name: string;
                    join_code: string;
                    created_by: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    event_id: string;
                    name: string;
                    join_code: string;
                    created_by: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    event_id?: string;
                    name?: string;
                    join_code?: string;
                    created_by?: string;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "teams_event_id_fkey";
                        columns: ["event_id"];
                        referencedRelation: "events";
                        referencedColumns: ["id"];
                    }
                ];
            };
            startups: {
                Row: {
                    id: string;
                    name: string;
                    logo_url: string | null;
                    description: string | null;
                    website_url: string | null;
                    founder_names: string | null;
                    founded_year: string | null;
                    status: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    logo_url?: string | null;
                    description?: string | null;
                    website_url?: string | null;
                    founder_names?: string | null;
                    founded_year?: string | null;
                    status?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    logo_url?: string | null;
                    description?: string | null;
                    website_url?: string | null;
                    founder_names?: string | null;
                    founded_year?: string | null;
                    status?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            profiles: {
                Row: {
                    id: string;
                    updated_at: string | null;
                    full_name: string | null;
                    avatar_url: string | null;
                    bio: string | null;
                    website: string | null;
                    phone: string | null;
                    qr_code_url: string | null;
                    role: string;
                    age: number | null;
                    gender: string | null;
                    esummit_checked_in: boolean;
                    esummit_checked_in_at: string | null;
                };
                Insert: {
                    id: string;
                    updated_at?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    website?: string | null;
                    phone?: string | null;
                    qr_code_url?: string | null;
                    role?: string;
                    age?: number | null;
                    gender?: string | null;
                    esummit_checked_in?: boolean;
                    esummit_checked_in_at?: string | null;
                };
                Update: {
                    id?: string;
                    updated_at?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    website?: string | null;
                    phone?: string | null;
                    qr_code_url?: string | null;
                    role?: string;
                    age?: number | null;
                    gender?: string | null;
                    esummit_checked_in?: boolean;
                    esummit_checked_in_at?: string | null;
                };
                Relationships: [];
            };
            contact_messages: {
                Row: {
                    id: string;
                    created_at: string;
                    name: string;
                    email: string;
                    subject: string;
                    message: string;
                    source: 'ecell' | 'esummit';
                    status: 'new' | 'read' | 'replied';
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    name: string;
                    email: string;
                    subject: string;
                    message: string;
                    source: 'ecell' | 'esummit';
                    status?: 'new' | 'read' | 'replied';
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    name?: string;
                    email?: string;
                    subject?: string;
                    message?: string;
                    source?: 'ecell' | 'esummit';
                    status?: 'new' | 'read' | 'replied';
                };
                Relationships: [];
            };
            admin_whitelist: {
                Row: {
                    id: string;
                    email: string;
                    role: 'admin' | 'super_admin';
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    role?: 'admin' | 'super_admin';
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    role?: 'admin' | 'super_admin';
                    created_at?: string;
                };
                Relationships: [];
            };
            login_attempts: {
                Row: {
                    id: string;
                    email: string;
                    attempts: number;
                    last_attempt: string;
                    locked_until: string | null;
                    ip_address: string | null;
                };
                Insert: {
                    id?: string;
                    email: string;
                    attempts?: number;
                    last_attempt?: string;
                    locked_until?: string | null;
                    ip_address?: string | null;
                };
                Update: {
                    id?: string;
                    email?: string;
                    attempts?: number;
                    last_attempt?: string;
                    locked_until?: string | null;
                    ip_address?: string | null;
                };
                Relationships: [];
            };
            impact_metrics: {
                Row: {
                    id: string;
                    label: string;
                    value: string;
                    description: string | null;
                    display_order: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    label: string;
                    value: string;
                    description?: string | null;
                    display_order?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    label?: string;
                    value?: string;
                    description?: string | null;
                    display_order?: number;
                    created_at?: string;
                };
                Relationships: [];
            };
            site_settings: {
                Row: {
                    id: number;
                    contact_email: string | null;
                    contact_phone: string | null;
                    address: string | null;
                    facebook_url: string | null;
                    twitter_url: string | null;
                    instagram_url: string | null;
                    linkedin_url: string | null;
                    youtube_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: number;
                    contact_email?: string | null;
                    contact_phone?: string | null;
                    address?: string | null;
                    facebook_url?: string | null;
                    twitter_url?: string | null;
                    instagram_url?: string | null;
                    linkedin_url?: string | null;
                    youtube_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: number;
                    contact_email?: string | null;
                    contact_phone?: string | null;
                    address?: string | null;
                    facebook_url?: string | null;
                    twitter_url?: string | null;
                    instagram_url?: string | null;
                    linkedin_url?: string | null;
                    youtube_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            esummit_stats: {
                Row: {
                    id: string;
                    label: string;
                    value: string;
                    display_order: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    label: string;
                    value: string;
                    display_order?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    label?: string;
                    value?: string;
                    display_order?: number;
                    created_at?: string;
                };
                Relationships: [];
            };
            esummit_blueprint: {
                Row: {
                    id: string;
                    title: string;
                    description: string;
                    icon: string;
                    align: 'left' | 'right';
                    display_order: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    description: string;
                    icon: string;
                    align?: 'left' | 'right';
                    display_order?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    description?: string;
                    icon?: string;
                    align?: 'left' | 'right';
                    display_order?: number;
                    created_at?: string;
                };
                Relationships: [];
            };
            esummit_settings: {
                Row: {
                    id: number;
                    show_stats: boolean;
                    show_blueprint: boolean;
                    scanner_password: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: number;
                    show_stats?: boolean;
                    show_blueprint?: boolean;
                    scanner_password?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: number;
                    show_stats?: boolean;
                    show_blueprint?: boolean;
                    scanner_password?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            check_admin_access: {
                Args: {
                    check_email: string;
                };
                Returns: boolean;
            };
            check_lockout_status: {
                Args: {
                    check_email: string;
                };
                Returns: Json;
            };
            log_login_attempt: {
                Args: {
                    check_email: string;
                    is_success: boolean;
                };
                Returns: undefined;
            };
            verify_scanner_password: {
                Args: {
                    input_password: string;
                };
                Returns: boolean;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}
