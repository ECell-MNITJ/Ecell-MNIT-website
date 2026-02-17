-- ============================================
-- E-Cell MNIT Website - Supabase Database Schema
-- ============================================
-- Run this in your Supabase SQL Editor
-- Project Settings > SQL Editor > New Query

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Team Members Table
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    position TEXT NOT NULL,
    bio TEXT,
    image_url TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for ordering
CREATE INDEX IF NOT EXISTS idx_team_members_order ON team_members(order_index);

-- ============================================
-- Events Table
-- ============================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    location TEXT,
    image_url TEXT,
    registration_link TEXT,
    details_url TEXT,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'past')),
    is_esummit BOOLEAN DEFAULT FALSE, -- Added for E-Summit filtering
    registrations_open BOOLEAN DEFAULT TRUE, -- Added for toggling registration
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date DESC);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured) WHERE featured = TRUE;

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Public read access for team members
CREATE POLICY "Team members are viewable by everyone"
    ON team_members FOR SELECT
    USING (true);

-- Authenticated users can insert/update/delete team members
CREATE POLICY "Authenticated users can insert team members"
    ON team_members FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update team members"
    ON team_members FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete team members"
    ON team_members FOR DELETE
    USING (auth.role() = 'authenticated');

-- Public read access for events
CREATE POLICY "Events are viewable by everyone"
    ON events FOR SELECT
    USING (true);

-- Authenticated users can insert/update/delete events
CREATE POLICY "Authenticated users can insert events"
    ON events FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update events"
    ON events FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete events"
    ON events FOR DELETE
    USING (auth.role() = 'authenticated');

-- ============================================
-- Storage Buckets (Run these after creating the schema)
-- ============================================
-- Go to Storage in Supabase Dashboard and create two buckets:
-- 1. "team-images" (public)
-- 2. "event-images" (public)
--
-- Then run these policies in SQL Editor:

-- Storage policies for team-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-images', 'team-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public team images access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'team-images');

CREATE POLICY "Authenticated users can upload team images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'team-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update team images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'team-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete team images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'team-images' AND auth.role() = 'authenticated');

-- Storage policies for event-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public event images access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can upload event images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'event-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update event images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'event-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete event images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'event-images' AND auth.role() = 'authenticated');

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Insert sample team members
INSERT INTO team_members (name, role, position, bio, order_index)
VALUES 
    ('John Doe', 'President', 'Leadership', 'Passionate about entrepreneurship and innovation.', 1),
    ('Jane Smith', 'Vice President', 'Leadership', 'Leading the tech initiatives at E-Cell.', 2),
    ('Alex Johnson', 'Technical Lead', 'Technology', 'Building amazing web experiences.', 3)
ON CONFLICT DO NOTHING;

-- Insert sample events
INSERT INTO events (title, description, date, category, status, featured)
VALUES 
    ('E-Summit 2026', 'Our flagship entrepreneurship summit featuring renowned speakers and startup competitions.', '2026-03-15 09:00:00+00', 'Summit', 'upcoming', true),
    ('Startup Workshop', 'Hands-on workshop covering business model canvas and pitching strategies.', '2024-04-01 14:00:00+00', 'Workshop', 'upcoming', false),
    ('Pitch Perfect', 'Battle of ideas where students pitch innovative solutions to investors.', '2024-01-20 16:00:00+00', 'Competition', 'past', false)
ON CONFLICT DO NOTHING;
