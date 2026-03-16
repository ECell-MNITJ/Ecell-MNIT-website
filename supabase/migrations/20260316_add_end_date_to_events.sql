-- Add end_date column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- Backfill existing events: default end_date to 3 hours after start date if not set
UPDATE public.events 
SET end_date = date + INTERVAL '3 hours' 
WHERE end_date IS NULL AND is_esummit = true;
