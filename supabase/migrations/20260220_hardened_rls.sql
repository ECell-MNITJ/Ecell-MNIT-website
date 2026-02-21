-- ============================================
-- COMPREHENSIVE SECURITY HARDENING - RLS OVERHAUL
-- ============================================
-- This migration replaces insecure 'authenticated' checks with 'is_admin()' 
-- across all core tables to prevent unauthorized data modification.

-- 1. Events Table Hardening
DROP POLICY IF EXISTS "Authenticated users can insert events" ON events;
DROP POLICY IF EXISTS "Authenticated users can update events" ON events;
DROP POLICY IF EXISTS "Authenticated users can delete events" ON events;

CREATE POLICY "Admins can insert events" ON events FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update events" ON events FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete events" ON events FOR DELETE USING (public.is_admin());

-- 2. Team Members Table Hardening
DROP POLICY IF EXISTS "Authenticated users can insert team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can update team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can delete team members" ON team_members;

CREATE POLICY "Admins can insert team members" ON team_members FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update team members" ON team_members FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete team members" ON team_members FOR DELETE USING (public.is_admin());

-- 3. Startups Table Hardening
DROP POLICY IF EXISTS "Admins can manage startups" ON startups;
CREATE POLICY "Admins can manage startups" ON startups FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. Impact Metrics Table Hardening
DROP POLICY IF EXISTS "Authenticated users can insert impact metrics" ON impact_metrics;
DROP POLICY IF EXISTS "Authenticated users can update impact metrics" ON impact_metrics;
DROP POLICY IF EXISTS "Authenticated users can delete impact metrics" ON impact_metrics;

CREATE POLICY "Admins can insert impact metrics" ON impact_metrics FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update impact metrics" ON impact_metrics FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete impact metrics" ON impact_metrics FOR DELETE USING (public.is_admin());

-- 5. E-Summit Stats & Blueprint Hardening
DROP POLICY IF EXISTS "Admins can insert stats" ON esummit_stats;
DROP POLICY IF EXISTS "Admins can update stats" ON esummit_stats;
DROP POLICY IF EXISTS "Admins can delete stats" ON esummit_stats;

CREATE POLICY "Admins can insert stats" ON esummit_stats FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update stats" ON esummit_stats FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete stats" ON esummit_stats FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert blueprint" ON esummit_blueprint;
DROP POLICY IF EXISTS "Admins can update blueprint" ON esummit_blueprint;
DROP POLICY IF EXISTS "Admins can delete blueprint" ON esummit_blueprint;

CREATE POLICY "Admins can insert blueprint" ON esummit_blueprint FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update blueprint" ON esummit_blueprint FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete blueprint" ON esummit_blueprint FOR DELETE USING (public.is_admin());

-- 6. Storage Bucket Hardening
-- We restrict bucket modification to admins
DROP POLICY IF EXISTS "Authenticated users can upload team images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update team images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete team images" ON storage.objects;

CREATE POLICY "Admins can upload team images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'team-images' AND public.is_admin());
CREATE POLICY "Admins can update team images" ON storage.objects FOR UPDATE USING (bucket_id = 'team-images' AND public.is_admin());
CREATE POLICY "Admins can delete team images" ON storage.objects FOR DELETE USING (bucket_id = 'team-images' AND public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete event images" ON storage.objects;

CREATE POLICY "Admins can upload event images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'event-images' AND public.is_admin());
CREATE POLICY "Admins can update event images" ON storage.objects FOR UPDATE USING (bucket_id = 'event-images' AND public.is_admin());
CREATE POLICY "Admins can delete event images" ON storage.objects FOR DELETE USING (bucket_id = 'event-images' AND public.is_admin());

-- 7. Contact Messages Hardening
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can view contact messages" ON contact_messages;

CREATE POLICY "Public can insert contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all contact messages" ON contact_messages FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update/delete contact messages" ON contact_messages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8. Gallery Hardening
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view gallery" ON gallery_images;
DROP POLICY IF EXISTS "Admins can manage gallery_images" ON gallery_images;
CREATE POLICY "Public can view gallery images" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage gallery images" ON gallery_images FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view collections" ON gallery_collections;
DROP POLICY IF EXISTS "Admins can manage gallery_collections" ON gallery_collections;
CREATE POLICY "Public can view gallery collections" ON gallery_collections FOR SELECT USING (true);
CREATE POLICY "Admins can manage gallery collections" ON gallery_collections FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view sections" ON gallery_sections;
DROP POLICY IF EXISTS "Admins can manage gallery_sections" ON gallery_sections;
CREATE POLICY "Public can view gallery sections" ON gallery_sections FOR SELECT USING (true);
CREATE POLICY "Admins can manage gallery sections" ON gallery_sections FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 9. Settings Hardening
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE esummit_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public can view esummit settings" ON esummit_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage esummit settings" ON esummit_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 10. Event Registrations & Teams Hardening
-- Ensure admins can see everything
CREATE POLICY "Admins can view all registrations" ON event_registrations FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can view all teams" ON teams FOR SELECT USING (public.is_admin());
