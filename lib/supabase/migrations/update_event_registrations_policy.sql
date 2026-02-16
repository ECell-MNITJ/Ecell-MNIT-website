-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view own registrations" ON event_registrations;

-- Create a new policy allowing authenticated users to view all registrations
-- This allows users to see who is in their team (and who registered for events in general)
CREATE POLICY "Authenticated users can view registrations"
    ON event_registrations FOR SELECT
    TO authenticated
    USING (true);
