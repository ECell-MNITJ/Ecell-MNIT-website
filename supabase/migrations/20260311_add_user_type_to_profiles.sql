-- Migration to add user type and professional details to profiles
-- Source: User request for Student/Founder/Investor/Visitor details

-- 1. Add columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('Student', 'Founder', 'Investor', 'Visitor')),
ADD COLUMN IF NOT EXISTS college_name TEXT,
ADD COLUMN IF NOT EXISTS college_id_url TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS govt_id_url TEXT,
ADD COLUMN IF NOT EXISTS applied_referral_code TEXT;

-- 2. Create storage bucket for user documents/IDs
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-documents', 'user-documents', false) -- Private bucket for sensitive IDs
ON CONFLICT (id) DO NOTHING;

-- 3. RLS Policies for user-documents bucket

-- Allow users to read their own documents
CREATE POLICY "Users can read own documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to upload their own documents
-- The folder structure should be: bucket/user_id/filename
CREATE POLICY "Users can upload own documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'user-documents' AND 
        auth.role() = 'authenticated' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to delete their own documents
CREATE POLICY "Users can delete own documents"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
