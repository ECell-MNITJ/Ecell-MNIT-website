-- CONSOLIDATED PROFILE SCHEMA & PERMISSIONS FIX
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/nizhsrbjmsoauqohujmk/sql/new

-- 1. Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('Student', 'Founder', 'Investor', 'Visitor')),
ADD COLUMN IF NOT EXISTS college_name TEXT,
ADD COLUMN IF NOT EXISTS college_id_url TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS govt_id_url TEXT,
ADD COLUMN IF NOT EXISTS applied_referral_code TEXT,
ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- 2. Create storage bucket for user documents/IDs
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-documents', 'user-documents', false) -- Private bucket for sensitive IDs
ON CONFLICT (id) DO NOTHING;

-- 3. RLS Policies for user-documents bucket
DROP POLICY IF EXISTS "Users can read own documents" ON storage.objects;
CREATE POLICY "Users can read own documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'user-documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
CREATE POLICY "Users can upload own documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'user-documents' AND 
        auth.role() = 'authenticated' AND
        (auth.uid())::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
CREATE POLICY "Users can delete own documents"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'user-documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 4. Fix Profile Update Permissions (RLS)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 5. Fix the restrictive trigger to exempt the profile owner
CREATE OR REPLACE FUNCTION public.enforce_profile_update_restrictions()
RETURNS TRIGGER AS $$
BEGIN
    -- If current user is NOT an admin AND NOT the owner of the profile being updated
    IF NOT public.is_admin() AND auth.uid() <> NEW.id THEN
        -- Only allow staff to change specifically the check-in fields
        IF (NEW.role IS DISTINCT FROM OLD.role) OR
           (NEW.full_name IS DISTINCT FROM OLD.full_name) OR
           (NEW.id IS DISTINCT FROM OLD.id) OR
           (NEW.bio IS DISTINCT FROM OLD.bio) OR
           (NEW.website IS DISTINCT FROM OLD.website) OR
           (NEW.phone IS DISTINCT FROM OLD.phone) OR
           (NEW.avatar_url IS DISTINCT FROM OLD.avatar_url) OR
           (NEW.updated_at IS DISTINCT FROM OLD.updated_at) OR
           (NEW.qr_code_url IS DISTINCT FROM OLD.qr_code_url) OR
           (NEW.age IS DISTINCT FROM OLD.age) OR
           (NEW.gender IS DISTINCT FROM OLD.gender) OR
           (NEW.user_type IS DISTINCT FROM OLD.user_type) OR
           (NEW.college_name IS DISTINCT FROM OLD.college_name) OR
           (NEW.college_id_url IS DISTINCT FROM OLD.college_id_url) OR
           (NEW.company_name IS DISTINCT FROM OLD.company_name) OR
           (NEW.govt_id_url IS DISTINCT FROM OLD.govt_id_url) OR
           (NEW.applied_referral_code IS DISTINCT FROM OLD.applied_referral_code)
        THEN
            RAISE EXCEPTION 'Access Denied: Staff can only update check-in status (esummit_checked_in).';
        END IF;
    END IF;

    -- Extra safety: Don't let normal users change their own role even if they are the owner
    IF auth.uid() = NEW.id AND NOT public.is_admin() THEN
        IF (NEW.role IS DISTINCT FROM OLD.role) THEN
             NEW.role := OLD.role;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger a PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
