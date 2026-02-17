-- Add role column to profiles table if it doesn't exist
alter table public.profiles 
add column if not exists role text default 'user';

-- Add checked_in columns to event_registrations table
alter table public.event_registrations 
add column if not exists checked_in boolean default false,
add column if not exists checked_in_at timestamp with time zone;

-- Create index for performance
create index if not exists event_registrations_checked_in_idx on public.event_registrations(checked_in);
create index if not exists event_registrations_event_id_idx on public.event_registrations(event_id);

-- Policy to allow members/admins to update attendance
create policy "Allow members and admins to update attendance"
on public.event_registrations for update
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid()
    and (role = 'member' or role = 'admin' or role = 'super_admin')
  )
  or
  exists (
    select 1 from public.admin_whitelist
    where email = auth.jwt() ->> 'email'
    and (role = 'admin' or role = 'super_admin')
  )
);
