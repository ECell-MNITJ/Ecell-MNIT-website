-- Migration to add contact details to esummit_settings
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='esummit_settings' AND column_name='contact_email') THEN
        ALTER TABLE public.esummit_settings ADD COLUMN contact_email TEXT DEFAULT 'esummit@mnit.ac.in';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='esummit_settings' AND column_name='contact_phone') THEN
        ALTER TABLE public.esummit_settings ADD COLUMN contact_phone TEXT DEFAULT '+91 98765 43210';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='esummit_settings' AND column_name='contact_address') THEN
        ALTER TABLE public.esummit_settings ADD COLUMN contact_address TEXT DEFAULT 'Malaviya National Institute of Technology, JLN Marg, Jaipur, Rajasthan - 302017';
    END IF;
END $$;
