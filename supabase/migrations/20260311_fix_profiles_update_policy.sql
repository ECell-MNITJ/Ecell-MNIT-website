-- Migration to fix profile update permissions and restrictive trigger
-- This ensures users can update their own profiles while keeping staff restrictions for other users.

-- 1. Ensure a policy exists for users to update their own profiles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile"
        ON public.profiles
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- 2. Fix the trigger function to exempt the profile owner from staff field restrictions
CREATE OR REPLACE FUNCTION public.enforce_profile_update_restrictions()
RETURNS TRIGGER AS $$
BEGIN
    -- If current user is NOT an admin AND NOT the owner of the profile being updated
    IF NOT public.is_admin() AND auth.uid() <> NEW.id THEN
        -- Only allow staff to change specifically the check-in fields
        -- We compare OLD and NEW rows
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
    -- (This is handled by the WITH CHECK clause in the policy, but trigger is a good backup)
    IF auth.uid() = NEW.id AND NOT public.is_admin() THEN
        IF (NEW.role IS DISTINCT FROM OLD.role) THEN
             NEW.role := OLD.role; -- Silently revert role changes for owners who aren't admins
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
