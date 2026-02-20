-- App Venue Maps table
CREATE TABLE IF NOT EXISTS public.app_venue_maps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  google_maps_url TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_venue_maps ENABLE ROW LEVEL SECURITY;

-- Anyone can read venues
CREATE POLICY "Public read venue maps"
  ON public.app_venue_maps FOR SELECT
  USING (true);

-- Only admins can write
CREATE POLICY "Admins can manage venue maps"
  ON public.app_venue_maps FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_whitelist WHERE email = auth.jwt()->>'email')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- App Emergency Contacts table
CREATE TABLE IF NOT EXISTS public.app_emergency_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read emergency contacts"
  ON public.app_emergency_contacts FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage emergency contacts"
  ON public.app_emergency_contacts FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_whitelist WHERE email = auth.jwt()->>'email')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- App Settings table (key-value)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read app settings"
  ON public.app_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage app settings"
  ON public.app_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_whitelist WHERE email = auth.jwt()->>'email')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed default settings keys
INSERT INTO public.app_settings (key, value) VALUES
  ('about_url', 'https://ecellmnit.com'),
  ('instagram_url', ''),
  ('linkedin_url', ''),
  ('twitter_url', ''),
  ('youtube_url', ''),
  ('facebook_url', '')
ON CONFLICT (key) DO NOTHING;
