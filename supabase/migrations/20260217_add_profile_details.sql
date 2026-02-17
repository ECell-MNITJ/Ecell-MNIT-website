-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS age integer;

-- Update RLS policies to ensure users can update their own profile
-- (Assuming existing policy handles this, but good to verify/ensure)
-- The existing policy usually allows users to update their own rows based on id = auth.uid()
