-- Add esummit_checked_in and esummit_checked_in_at columns to profiles table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS esummit_checked_in BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS esummit_checked_in_at TIMESTAMPTZ;

-- Update RLS policies if necessary (usually existing ones cover update/select for owner/admin)
-- Just in case, ensure admins can update these columns (they can update rows already)
