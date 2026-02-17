-- Create a table for E-Summit settings (singleton)
create table if not exists public.esummit_settings (
  id int8 not null default 1,
  show_stats boolean default true,
  show_blueprint boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint esummit_settings_pkey primary key (id),
  constraint esummit_settings_id_check check (id = 1)
);

-- Insert default row if not exists
insert into public.esummit_settings (id, show_stats, show_blueprint)
values (1, true, true)
on conflict (id) do nothing;

-- Enable RLS
alter table public.esummit_settings enable row level security;

-- Policies
create policy "Enable read access for all users"
on public.esummit_settings for select
using (true);

create policy "Enable update access for admins"
on public.esummit_settings for update
using (
  exists (
    select 1 from public.admin_whitelist
    where email = auth.jwt() ->> 'email'
    and (role = 'admin' or role = 'super_admin')
  )
);
