-- Add registrations_open column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS registrations_open BOOLEAN DEFAULT TRUE;
