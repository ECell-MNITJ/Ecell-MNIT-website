-- Migration to add Campus Ambassador & Passes system for E-Summit

-- 1. Create esummit_passes table
CREATE TABLE IF NOT EXISTS public.esummit_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    description TEXT,
    features TEXT[], -- Array of features like ['Access to all events', 'Free lunch']
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for esummit_passes
ALTER TABLE public.esummit_passes ENABLE ROW LEVEL SECURITY;

-- Policies for esummit_passes
CREATE POLICY "Public can view active passes" ON public.esummit_passes
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage passes" ON public.esummit_passes
    FOR ALL
    USING (public.check_admin_access(auth.jwt() ->> 'email'))
    WITH CHECK (public.check_admin_access(auth.jwt() ->> 'email'));

-- 2. Create campus_ambassadors table
CREATE TABLE IF NOT EXISTS public.campus_ambassadors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    label TEXT, -- For generic codes like 'SUMMER2026'
    college TEXT,
    year_of_study TEXT,
    phone_number TEXT,
    is_active BOOLEAN DEFAULT true,
    discount_override INTEGER, -- Optional custom discount % for this specific code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(profile_id)
);

-- Enable RLS for campus_ambassadors
ALTER TABLE public.campus_ambassadors ENABLE ROW LEVEL SECURITY;

-- Policies for campus_ambassadors
CREATE POLICY "Public can view CA referral codes" ON public.campus_ambassadors
    FOR SELECT USING (true); -- Needed so anyone can apply a code

CREATE POLICY "Users can register as CA" ON public.campus_ambassadors
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can view own CA status" ON public.campus_ambassadors
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Admins can manage CAs" ON public.campus_ambassadors
    FOR ALL
    USING (public.check_admin_access(auth.jwt() ->> 'email'))
    WITH CHECK (public.check_admin_access(auth.jwt() ->> 'email'));

-- 3. Create user_passes table (Purchases)
CREATE TABLE IF NOT EXISTS public.user_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pass_id UUID NOT NULL REFERENCES public.esummit_passes(id) ON DELETE CASCADE,
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT UNIQUE,
    payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'success', 'failed')),
    amount_paid NUMERIC(10, 2) NOT NULL CHECK (amount_paid >= 0),
    applied_referral_code TEXT REFERENCES public.campus_ambassadors(referral_code) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, pass_id) -- A user usually only needs one of each pass, or perhaps just one pass overall depending on logic, but for now we restrict to 1 of each type
);

-- Enable RLS for user_passes
ALTER TABLE public.user_passes ENABLE ROW LEVEL SECURITY;

-- Policies for user_passes
CREATE POLICY "Users can view their own passes" ON public.user_passes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own passes" ON public.user_passes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage user passes" ON public.user_passes
    FOR ALL
    USING (public.check_admin_access(auth.jwt() ->> 'email'))
    WITH CHECK (public.check_admin_access(auth.jwt() ->> 'email'));


-- 4. Add CA discount settings to esummit_settings
-- We add these to the end of the existing row (id=1 usually, but alter table affects all)
ALTER TABLE public.esummit_settings 
ADD COLUMN IF NOT EXISTS ca_base_discount_percentage NUMERIC(5, 2) DEFAULT 0 CHECK (ca_base_discount_percentage >= 0 AND ca_base_discount_percentage <= 100),
ADD COLUMN IF NOT EXISTS ca_milestone_1_count INTEGER DEFAULT 0 CHECK (ca_milestone_1_count >= 0),
ADD COLUMN IF NOT EXISTS ca_milestone_1_discount NUMERIC(5, 2) DEFAULT 0 CHECK (ca_milestone_1_discount >= 0 AND ca_milestone_1_discount <= 100),
ADD COLUMN IF NOT EXISTS ca_milestone_2_count INTEGER DEFAULT 0 CHECK (ca_milestone_2_count >= 0),
ADD COLUMN IF NOT EXISTS ca_milestone_2_discount NUMERIC(5, 2) DEFAULT 0 CHECK (ca_milestone_2_discount >= 0 AND ca_milestone_2_discount <= 100);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_esummit_passes_modtime
    BEFORE UPDATE ON public.esummit_passes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
