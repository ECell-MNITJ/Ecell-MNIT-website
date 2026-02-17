-- Add image_url column to esummit_blueprint table
ALTER TABLE esummit_blueprint
ADD COLUMN IF NOT EXISTS image_url text;

-- Create a storage bucket for E-Summit uploads
insert into storage.buckets (id, name, public)
values ('esummit_uploads', 'esummit_uploads', true)
on conflict (id) do nothing;

-- Set up RLS for the storage bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'esummit_uploads' );

create policy "Authenticated Admin Insert"
  on storage.objects for insert
  with check ( bucket_id = 'esummit_uploads' and auth.role() = 'authenticated' );

create policy "Authenticated Admin Update"
  on storage.objects for update
  using ( bucket_id = 'esummit_uploads' and auth.role() = 'authenticated' );

create policy "Authenticated Admin Delete"
  on storage.objects for delete
  using ( bucket_id = 'esummit_uploads' and auth.role() = 'authenticated' );
