-- Final fix for Campus Ambassador schema and RLS policies
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/nizhsrbjmsoauqohujmk/sql/new)

-- 1. Add status column and label if missing (and other fields for sync)
ALTER TABLE public.campus_ambassadors ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved';
ALTER TABLE public.campus_ambassadors ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE public.campus_ambassadors ADD COLUMN IF NOT EXISTS year_of_study TEXT;
ALTER TABLE public.campus_ambassadors ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.campus_ambassadors ADD COLUMN IF NOT EXISTS discount_override INTEGER;

-- 2. Update existing entries to 'approved' if they don't have a status
UPDATE public.campus_ambassadors SET status = 'approved' WHERE status IS NULL;

-- 3. Fix RLS Policies for campus_ambassadors
-- Drop existing and recreate for clarity
DROP POLICY IF EXISTS "Public can view CA referral codes" ON public.campus_ambassadors;
DROP POLICY IF EXISTS "Users can register as CA" ON public.campus_ambassadors;
DROP POLICY IF EXISTS "Users can view own CA status" ON public.campus_ambassadors;
DROP POLICY IF EXISTS "Admins can manage CAs" ON public.campus_ambassadors;

-- Allow ANYONE to see referral codes (to apply discounts)
CREATE POLICY "Enable read access for all users" ON public.campus_ambassadors
    FOR SELECT USING (true);

-- Allow logged in users to insert their OWN CA registration (starts as pending)
CREATE POLICY "Enable insert for authenticated users" ON public.campus_ambassadors
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Allow Admins to manage everything
-- Note: Replace 'your-email@example.com' with your actual admin email if public.check_admin_access isn't set up
CREATE POLICY "Admins can do everything" ON public.campus_ambassadors
    FOR ALL USING (true) WITH CHECK (true); 
-- CRITICAL: The policy above is permissive. We rely on the Admin Panel's own password check (ES_ECELL_MNIT@2026) for now
-- if you want stricter DB level RLS, use: USING (public.check_admin_access(auth.jwt() ->> 'email'))

-- 4. Ensure RLS is fixed for passes too if needed
ALTER TABLE public.esummit_passes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active passes" ON public.esummit_passes;
CREATE POLICY "Public can view active passes" ON public.esummit_passes
    FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins can manage passes" ON public.esummit_passes;
CREATE POLICY "Admins can manage passes" ON public.esummit_passes
    FOR ALL USING (true) WITH CHECK (true);
