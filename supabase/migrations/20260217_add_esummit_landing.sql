-- Create table for E-Summit Stats (By the Numbers)
create table if not exists esummit_stats (
    id uuid default gen_random_uuid() primary key,
    label text not null,
    value text not null,
    display_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create table for E-Summit Blueprint Features
create table if not exists esummit_blueprint (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text not null,
    icon text not null, -- Store icon name (e.g., 'FiTarget')
    align text default 'left', -- 'left' or 'right'
    display_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table esummit_stats enable row level security;
alter table esummit_blueprint enable row level security;

-- Policies for Stats
create policy "Public stats are viewable by everyone"
    on esummit_stats for select
    using (true);

create policy "Admins can insert stats"
    on esummit_stats for insert
    with check (
        -- Simple check for now, can be enhanced with admin role check
        auth.role() = 'authenticated'
    );

create policy "Admins can update stats"
    on esummit_stats for update
    using (auth.role() = 'authenticated');

create policy "Admins can delete stats"
    on esummit_stats for delete
    using (auth.role() = 'authenticated');

-- Policies for Blueprint
create policy "Public blueprint is viewable by everyone"
    on esummit_blueprint for select
    using (true);

create policy "Admins can insert blueprint"
    on esummit_blueprint for insert
    with check (auth.role() = 'authenticated');

create policy "Admins can update blueprint"
    on esummit_blueprint for update
    using (auth.role() = 'authenticated');

create policy "Admins can delete blueprint"
    on esummit_blueprint for delete
    using (auth.role() = 'authenticated');
