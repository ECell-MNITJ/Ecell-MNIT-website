-- Add team configuration columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS is_team_event BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS min_team_size INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_team_size INTEGER DEFAULT 1;

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    join_code TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(event_id, join_code),  -- Join code unique per event
    UNIQUE(event_id, name)        -- Team name unique per event
);

-- Enable RLS for teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams are viewable by everyone" 
    ON teams FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create teams" 
    ON teams FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Update event_registrations to support teams
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'individual'; -- 'individual', 'leader', 'member'

-- Function to generate a unique 6-character join code
CREATE OR REPLACE FUNCTION generate_join_code() 
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;
