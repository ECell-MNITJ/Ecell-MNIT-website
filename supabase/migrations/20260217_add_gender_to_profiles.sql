-- Add gender column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS gender text;

-- Add check constraint for gender (optional but good for data integrity)
ALTER TABLE profiles
ADD CONSTRAINT gender_check CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say'));
