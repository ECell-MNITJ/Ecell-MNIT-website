-- Add missing columns to events table if they don't exist
alter table public.events 
add column if not exists is_esummit boolean default false,
add column if not exists is_team_event boolean default false,
add column if not exists min_team_size integer default 1,
add column if not exists max_team_size integer default 1,
add column if not exists registrations_open boolean default true;

-- Create index for performance
create index if not exists events_is_esummit_idx on public.events(is_esummit);
