-- Create startups table
CREATE TABLE IF NOT EXISTS startups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    website_url TEXT,
    founder_names TEXT,
    founded_year TEXT,
    status TEXT DEFAULT 'active', -- active, acquired, inactive
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow public read access
CREATE POLICY "Public can view startups" ON startups
    FOR SELECT TO public USING (true);

-- Allow authenticated users (admins) to insert, update, delete
CREATE POLICY "Admins can manage startups" ON startups
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create storage bucket for startup logos if it doesn't exist (handled via dashboard usually, but good to note)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('startup-logos', 'startup-logos', true) ON CONFLICT DO NOTHING;
