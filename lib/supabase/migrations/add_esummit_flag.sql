-- Add is_esummit column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_esummit BOOLEAN DEFAULT FALSE;

-- Update existing events (optional, default is false anyway)
-- UPDATE public.events SET is_esummit = FALSE WHERE is_esummit IS NULL;
