-- Migration: Add details_url column to events table
-- Run this in your Supabase SQL Editor

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS details_url TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN events.details_url IS 'Optional custom URL for event details page. If provided, users will be redirected to this URL instead of the default event page.';
