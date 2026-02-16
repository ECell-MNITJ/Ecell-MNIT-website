-- Create impact_metrics table
CREATE TABLE IF NOT EXISTS impact_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE impact_metrics ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Impact metrics are viewable by everyone"
    ON impact_metrics FOR SELECT
    USING (true);

-- Authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can insert impact metrics"
    ON impact_metrics FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update impact metrics"
    ON impact_metrics FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete impact metrics"
    ON impact_metrics FOR DELETE
    USING (auth.role() = 'authenticated');

-- Insert initial sample data
INSERT INTO impact_metrics (label, value, description, display_order)
VALUES 
    ('Startups Incubated', '50+', 'Over 50 successful startups incubated.', 1),
    ('Mentors', '200+', 'Network of industry experts and mentors.', 2),
    ('Events', '100+', 'Workshops, competitions and guest lectures.', 3)
ON CONFLICT DO NOTHING;
