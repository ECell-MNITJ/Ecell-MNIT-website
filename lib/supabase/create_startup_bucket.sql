-- Create 'startup-logos' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('startup-logos', 'startup-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies for startup-logos to avoid conflicts
DROP POLICY IF EXISTS "Public startup logos access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload startup logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update startup logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete startup logos" ON storage.objects;

-- Create policies

-- 1. Public Access (Read-only)
CREATE POLICY "Public startup logos access"
ON storage.objects FOR SELECT
USING (bucket_id = 'startup-logos');

-- 2. Authenticated Upload (Insert)
CREATE POLICY "Authenticated users can upload startup logos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'startup-logos' 
    AND auth.role() = 'authenticated'
);

-- 3. Authenticated Update
CREATE POLICY "Authenticated users can update startup logos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'startup-logos' 
    AND auth.role() = 'authenticated'
);

-- 4. Authenticated Delete
CREATE POLICY "Authenticated users can delete startup logos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'startup-logos' 
    AND auth.role() = 'authenticated'
);
