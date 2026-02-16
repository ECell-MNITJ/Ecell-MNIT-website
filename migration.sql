-- Add registrations_open column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS registrations_open BOOLEAN DEFAULT TRUE;

-- Update existing events to have registrations_open = TRUE (redundant with default but good for clarity)
UPDATE events SET registrations_open = TRUE WHERE registrations_open IS NULL;

-- Create impact_metrics table
CREATE TABLE IF NOT EXISTS impact_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE impact_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies (allow read for all, write for authenticated)
CREATE POLICY "Allow public read access" ON impact_metrics FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON impact_metrics FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON impact_metrics FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON impact_metrics FOR DELETE USING (auth.role() = 'authenticated');
