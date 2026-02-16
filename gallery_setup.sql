-- 1. Create the 'gallery' bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS (just in case, though usually enabled by default on storage.objects)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies

-- Allow Public Read Access (Everyone can view images)
CREATE POLICY "Public Access Gallery"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'gallery' );

-- Allow Authenticated Uploads (Only logged-in users can upload)
CREATE POLICY "Authenticated Upload Gallery"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'gallery' );

-- Allow Authenticated Updates
CREATE POLICY "Authenticated Update Gallery"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'gallery' );

-- Allow Authenticated Deletes
CREATE POLICY "Authenticated Delete Gallery"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'gallery' );
