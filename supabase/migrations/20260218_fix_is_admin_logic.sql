
-- Fix is_admin function to check admin_whitelist as well
-- This ensures that users who are admins in the whitelist but haven't had their profile role updated can VIEW the participants list.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  current_email text;
BEGIN
  -- Get email from auth session
  current_email := auth.jwt() ->> 'email';
  
  -- If not in JWT, try query
  IF current_email IS NULL THEN
    SELECT email INTO current_email FROM auth.users WHERE id = auth.uid();
  END IF;

  -- 1. Check profiles (existing logic)
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RETURN true;
  END IF;

  -- 2. Check admin_whitelist (new logic)
  IF EXISTS (
    SELECT 1 FROM admin_whitelist
    WHERE email = current_email
    AND (role = 'admin' OR role = 'super_admin')
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;
