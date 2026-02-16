-- Add event_details JSONB column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS event_details JSONB DEFAULT '{}'::jsonb;

-- Comment on column
COMMENT ON COLUMN events.event_details IS 'Stores unstructured event data like agenda, speakers, gallery, and faq';
