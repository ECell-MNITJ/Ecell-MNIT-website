-- =================================================================
-- Migration: Totally Remove Document Upload Feature
-- Created: 2026-03-18
-- =================================================================

-- 1. Update the restrictive trigger function to remove references to deleted columns
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
           (NEW.company_name IS DISTINCT FROM OLD.company_name) OR
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

-- 2. Drop the document-related columns from profiles
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS college_id_url,
DROP COLUMN IF EXISTS govt_id_url;

-- 3. Storage bucket 'user-documents' was manually deleted by the user.
-- No further storage cleanup needed in this script.

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
