-- Add detailed_description column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS detailed_description TEXT;

-- Verify the column was added (optional, for manual check)
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'events' AND column_name = 'detailed_description';
