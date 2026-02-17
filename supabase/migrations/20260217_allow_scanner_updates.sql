-- Create a function to check if the current user is staff (admin or member)
CREATE OR REPLACE FUNCTION is_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'member')
  );
$$;

-- Allow staff to VIEW all profiles (needed for scanning)
CREATE POLICY "Staff can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  is_staff()
);

-- Allow staff to UPDATE all profiles (needed for check-in)
-- We might want to restrict this to only esummit_checked_in columns, but RLS is row-level.
-- For now, trust staff not to wipe data, or rely on UI limits.
CREATE POLICY "Staff can update profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  is_staff()
)
WITH CHECK (
  is_staff()
);
