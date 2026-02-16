-- ============================================
-- Fix Storage RLS Policies
-- ============================================

-- Enable the PGCRYPTO extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-images', 'team-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public team images access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload team images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update team images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete team images" ON storage.objects;

DROP POLICY IF EXISTS "Public event images access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete event images" ON storage.objects;

-- 3. Re-create policies correctly

-- Team Images
CREATE POLICY "Public team images access"
ON storage.objects FOR SELECT
USING (bucket_id = 'team-images');

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

-- Event Images
CREATE POLICY "Public event images access"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

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
