-- Add sponsors settings to esummit_settings
ALTER TABLE public.esummit_settings 
ADD COLUMN IF NOT EXISTS show_sponsors BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sponsors_heading TEXT DEFAULT 'Our Sponsors';

-- Create esummit_sponsors table
CREATE TABLE IF NOT EXISTS public.esummit_sponsors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.esummit_sponsors ENABLE ROW LEVEL SECURITY;

-- Create policies for esummit_sponsors
CREATE POLICY "Public can view esummit sponsors" 
    ON public.esummit_sponsors FOR SELECT 
    USING (true);

-- Admin policies
CREATE POLICY "Admins can insert esummit sponsors"
ON public.esummit_sponsors FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_whitelist
        WHERE email = auth.jwt() ->> 'email'
    )
);

CREATE POLICY "Admins can update esummit sponsors"
ON public.esummit_sponsors FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM admin_whitelist
        WHERE email = auth.jwt() ->> 'email'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_whitelist
        WHERE email = auth.jwt() ->> 'email'
    )
);

CREATE POLICY "Admins can delete esummit sponsors"
ON public.esummit_sponsors FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM admin_whitelist
        WHERE email = auth.jwt() ->> 'email'
    )
);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_esummit_sponsors_updated_at
    BEFORE UPDATE ON public.esummit_sponsors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
