-- Add CA registration toggle to esummit_settings

ALTER TABLE public.esummit_settings 
ADD COLUMN IF NOT EXISTS ca_registrations_open BOOLEAN DEFAULT true;
