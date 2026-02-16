-- 1. Fix event_registrations policy
-- Drop the restrictive policy if it exists
DROP POLICY IF EXISTS "Users can view own registrations" ON event_registrations;

-- Ensure authenticated users can view all registrations (needed for admin & team view)
DROP POLICY IF EXISTS "Authenticated users can view registrations" ON event_registrations;
CREATE POLICY "Authenticated users can view registrations"
    ON event_registrations FOR SELECT
    TO authenticated
    USING (true);

-- 2. Fix teams policy
-- Ensure teams are viewable by everyone (or at least authenticated)
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON teams;
CREATE POLICY "Teams are viewable by everyone" 
    ON teams FOR SELECT USING (true);

-- 3. Fix profiles policy
-- Ensure profiles are viewable by everyone
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING (true);

-- 4. Grant schema usage (sometimes needed depending on role setup, usually automatic for public/authenticated)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
