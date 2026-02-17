-- Add social media columns to esummit_settings
alter table public.esummit_settings
add column if not exists instagram_url text,
add column if not exists linkedin_url text,
add column if not exists twitter_url text,
add column if not exists facebook_url text,
add column if not exists youtube_url text;
