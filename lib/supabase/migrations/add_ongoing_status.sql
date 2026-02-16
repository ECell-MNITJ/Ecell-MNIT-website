-- Migration: Add 'ongoing' status to events table
-- Run this in your Supabase SQL Editor

-- Drop the old constraint
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;

-- Add new constraint with 'ongoing' status
ALTER TABLE events ADD CONSTRAINT events_status_check 
  CHECK (status IN ('upcoming', 'ongoing', 'past'));

-- Verify the migration
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'events_status_check';
