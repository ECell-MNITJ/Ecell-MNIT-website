ALTER TABLE public.event_registrations 
ADD COLUMN IF NOT EXISTS registration_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Function to generate a random 6-character alphanumeric code
CREATE OR REPLACE FUNCTION generate_registration_id() 
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Exclude confusing chars 1, I, 0, O
    result TEXT := 'ES-';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars))::integer + 1, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Trigger function to set registration_id on insert if not provided
CREATE OR REPLACE FUNCTION set_registration_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.registration_id IS NULL THEN
        -- Loop until we get a unique ID (very low collision probability, but good for safety)
        LOOP
            NEW.registration_id := generate_registration_id();
            EXIT WHEN NOT EXISTS (SELECT 1 FROM public.event_registrations WHERE registration_id = NEW.registration_id);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS tr_set_registration_id ON public.event_registrations;
CREATE TRIGGER tr_set_registration_id
BEFORE INSERT ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION set_registration_id();

-- Backfill existing registrations
DO $$
DECLARE
    r RECORD;
    new_id TEXT;
BEGIN
    FOR r IN SELECT id FROM public.event_registrations WHERE registration_id IS NULL LOOP
        LOOP
            new_id := generate_registration_id();
            EXIT WHEN NOT EXISTS (SELECT 1 FROM public.event_registrations WHERE registration_id = new_id);
        END LOOP;
        UPDATE public.event_registrations SET registration_id = new_id WHERE id = r.id;
    END LOOP;
END $$;
