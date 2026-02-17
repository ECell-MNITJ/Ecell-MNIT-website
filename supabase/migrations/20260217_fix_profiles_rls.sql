-- Create a function to check if the current user is an admin
-- SECURITY DEFINER ensures this runs with owner privileges, bypassing RLS recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- Enable RLS on profiles (idempotent)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view all profiles
-- Drop if exists to avoid errors on re-run
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  is_admin()
);

-- Ensure users can view their own profile (if not already existing, though usually strictly separate policies are needed)
-- Safest to add this as well to ensure basic functionality
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);
