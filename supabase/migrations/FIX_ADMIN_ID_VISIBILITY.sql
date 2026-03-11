-- FIX STORAGE VISIBILITY & ADMIN ID ACCESS
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/nizhsrbjmsoauqohujmk/sql/new

-- 1. Make buckets public so getPublicUrl works reliably for valid links
UPDATE storage.buckets SET public = true WHERE id IN ('user-documents', 'avatars');

-- 2. Ensure admin exists and is identified correctly
-- (Assuming public.is_admin() already exists from previous scripts)

-- 3. Add Storage Policies for public read access (necessary even for public buckets if RLS is enabled on storage.objects)
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING (bucket_id IN ('user-documents', 'avatars'));

-- 4. Add Admin Overrides for all operations in these buckets
DROP POLICY IF EXISTS "Admins have full access to documents" ON storage.objects;
CREATE POLICY "Admins have full access to documents" 
ON storage.objects FOR ALL 
USING (
    bucket_id IN ('user-documents', 'avatars') AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 5. Final check for avatars
-- Make sure the bucket exists if it didn't
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
