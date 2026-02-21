-- ============================================
-- REVERT SECURITY CHANGES - ROLLBACK SCRIPT
-- ============================================
-- This script reverts all RLS policies, triggers, and functions 
-- implemented during the security hardening phase.

-- 1. Revert Profiles Table Changes
DROP TRIGGER IF EXISTS on_profile_update_staff_check ON public.profiles;
DROP FUNCTION IF EXISTS public.enforce_profile_update_restrictions();
DROP POLICY IF EXISTS "Staff can initiate check-in update" ON public.profiles;

-- Restore original staff update policy
CREATE POLICY "Staff can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  is_staff()
)
WITH CHECK (
  is_staff()
);

-- 2. Revert Events Table Policies
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can insert events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can update events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can delete events" ON public.events;

CREATE POLICY "Authenticated users can insert events"
    ON public.events FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update events"
    ON public.events FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete events"
    ON public.events FOR DELETE
    USING (auth.role() = 'authenticated');

-- 3. Revert Team Members Table Policies
DROP POLICY IF EXISTS "Admins can insert team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can update team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can delete team members" ON public.team_members;
DROP POLICY IF EXISTS "Authenticated users can insert team members" ON public.team_members;
DROP POLICY IF EXISTS "Authenticated users can update team members" ON public.team_members;
DROP POLICY IF EXISTS "Authenticated users can delete team members" ON public.team_members;

CREATE POLICY "Authenticated users can insert team members"
    ON public.team_members FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update team members"
    ON public.team_members FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete team members"
    ON public.team_members FOR DELETE
    USING (auth.role() = 'authenticated');

-- 4. Revert Startups Table Policies
DROP POLICY IF EXISTS "Admins can manage startups" ON public.startups;
CREATE POLICY "Admins can manage startups" ON public.startups
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Revert Impact Metrics Table Policies
DROP POLICY IF EXISTS "Admins can insert impact metrics" ON public.impact_metrics;
DROP POLICY IF EXISTS "Admins can update impact metrics" ON public.impact_metrics;
DROP POLICY IF EXISTS "Admins can delete impact metrics" ON public.impact_metrics;
DROP POLICY IF EXISTS "Authenticated users can insert impact metrics" ON public.impact_metrics;
DROP POLICY IF EXISTS "Authenticated users can update impact metrics" ON public.impact_metrics;
DROP POLICY IF EXISTS "Authenticated users can delete impact metrics" ON public.impact_metrics;

CREATE POLICY "Authenticated users can insert impact metrics"
    ON public.impact_metrics FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update impact metrics"
    ON public.impact_metrics FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete impact metrics"
    ON public.impact_metrics FOR DELETE
    USING (auth.role() = 'authenticated');

-- 6. Revert E-Summit Stats & Blueprint Policies
DROP POLICY IF EXISTS "Admins can insert stats" ON public.esummit_stats;
DROP POLICY IF EXISTS "Admins can update stats" ON public.esummit_stats;
DROP POLICY IF EXISTS "Admins can delete stats" ON public.esummit_stats;
DROP POLICY IF EXISTS "Authenticated users can insert stats" ON public.esummit_stats;
DROP POLICY IF EXISTS "Authenticated users can update stats" ON public.esummit_stats;
DROP POLICY IF EXISTS "Authenticated users can delete stats" ON public.esummit_stats;

CREATE POLICY "Admins can insert stats"
    ON public.esummit_stats FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update stats"
    ON public.esummit_stats FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete stats"
    ON public.esummit_stats FOR DELETE
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can insert blueprint" ON public.esummit_blueprint;
DROP POLICY IF EXISTS "Admins can update blueprint" ON public.esummit_blueprint;
DROP POLICY IF EXISTS "Admins can delete blueprint" ON public.esummit_blueprint;
DROP POLICY IF EXISTS "Authenticated users can insert blueprint" ON public.esummit_blueprint;
DROP POLICY IF EXISTS "Authenticated users can update blueprint" ON public.esummit_blueprint;
DROP POLICY IF EXISTS "Authenticated users can delete blueprint" ON public.esummit_blueprint;

CREATE POLICY "Admins can insert blueprint"
    ON public.esummit_blueprint FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update blueprint"
    ON public.esummit_blueprint FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete blueprint"
    ON public.esummit_blueprint FOR DELETE
    USING (auth.role() = 'authenticated');

-- 7. Revert Storage Policies
DROP POLICY IF EXISTS "Admins can upload team images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update team images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete team images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload team images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update team images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete team images" ON storage.objects;

CREATE POLICY "Authenticated users can upload team images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'team-images' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update team images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'team-images' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete team images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'team-images' 
    AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Admins can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update event images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete event images" ON storage.objects;

CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'event-images' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update event images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'event-images' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete event images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'event-images' 
    AND auth.role() = 'authenticated'
);

-- 8. Revert Contact Messages, Gallery, and Settings (Assuming RLS was disabled or had different defaults)
-- If you want to completely revert these to their "open" state:
DROP POLICY IF EXISTS "Admins can view all contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update/delete contact messages" ON public.contact_messages;
-- NOTE: Contact messages INSERT remains open (as intended for public)

DROP POLICY IF EXISTS "Admins can manage gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Admins can manage gallery collections" ON public.gallery_collections;
DROP POLICY IF EXISTS "Admins can manage gallery sections" ON public.gallery_sections;
-- These might need their original 'authenticated' policies restored if they existed, 
-- but they were not in the original schema.sql.

DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can manage esummit settings" ON public.esummit_settings;

-- 9. Revert view-only admin policies
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Admins can view all teams" ON public.teams;
