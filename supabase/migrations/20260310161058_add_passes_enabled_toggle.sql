-- Add passes_enabled column to esummit_settings
alter table public.esummit_settings add column if not exists passes_enabled boolean default true;

-- Update existing row to have passes_enabled = true
update public.esummit_settings set passes_enabled = true where id = 1;

-- Note: No RLS changes needed as select is already public
