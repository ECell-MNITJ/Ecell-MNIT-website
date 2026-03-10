-- Migration to add is_popular column to esummit_passes
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='esummit_passes' AND column_name='is_popular') THEN
        ALTER TABLE public.esummit_passes ADD COLUMN is_popular BOOLEAN DEFAULT false;
    END IF;
END $$;
