-- Create a table for site settings (singleton)
create table if not exists public.site_settings (
  id int8 not null default 1,
  contact_email text,
  contact_phone text,
  address text,
  facebook_url text,
  twitter_url text,
  instagram_url text,
  linkedin_url text,
  youtube_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint site_settings_pkey primary key (id),
  constraint site_settings_id_check check (id = 1)
);

-- Insert default row if not exists
insert into public.site_settings (
  id,
  contact_email, 
  contact_phone, 
  address, 
  facebook_url, 
  twitter_url, 
  instagram_url, 
  linkedin_url
)
values (
  1,
  'ecell@mnit.ac.in',
  '+91 95496 57348',
  'Malaviya National Institute of Technology, Jaipur, Rajasthan, India',
  'https://www.facebook.com/ecellmnit/',
  'https://twitter.com/ecell_mnit',
  'https://www.instagram.com/ecell_mnit/',
  'https://www.linkedin.com/company/ecell-mnit-jaipur/'
)
on conflict (id) do nothing;

-- Enable RLS
alter table public.site_settings enable row level security;

-- Policies
create policy "Enable read access for all users"
on public.site_settings for select
using (true);

create policy "Enable update access for admins"
on public.site_settings for update
using (
  exists (
    select 1 from public.admin_whitelist
    where email = auth.jwt() ->> 'email'
    and (role = 'admin' or role = 'super_admin')
  )
);
