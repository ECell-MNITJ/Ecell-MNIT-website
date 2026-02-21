-- Refine profiles RLS to prevent over-privileged staff updates
-- Only allow staff to update esummit_checked_in and esummit_checked_in_at columns

DROP POLICY IF EXISTS "Staff can update profiles" ON profiles;

-- We can't restrict columns in Policy itself, so we use a trigger to enforce it
-- or we can use a more restrictive policy and ensure UI only sends what's needed.
-- But for absolute security, a trigger is best.

CREATE OR REPLACE FUNCTION public.enforce_profile_update_restrictions()
RETURNS TRIGGER AS $$
BEGIN
    -- If current user is NOT an admin (only staff/member)
    IF NOT public.is_admin() THEN
        -- Only allow changing specifically the check-in fields
        -- In PostgreSQL/Supabase, we compare OLD and NEW rows
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
           (NEW.gender IS DISTINCT FROM OLD.gender)
        THEN
            RAISE EXCEPTION 'Access Denied: Staff can only update check-in status.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_update_staff_check ON profiles;
CREATE TRIGGER on_profile_update_staff_check
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE PROCEDURE public.enforce_profile_update_restrictions();

-- Keep the policy but name it more accurately
CREATE POLICY "Staff can initiate check-in update"
ON profiles
FOR UPDATE
TO authenticated
USING (
  is_staff()
)
WITH CHECK (
  is_staff()
);
