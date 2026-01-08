-- Enable the storage extension if not already enabled (usually enabled by default in Supabase)
-- create extension if not exists "storage";

-- Create a new private bucket named 'footprints'
insert into storage.buckets (id, name, public)
values ('footprints', 'footprints', true)
on conflict (id) do nothing;

-- Set up security policies for the 'footprints' bucket

-- 1. Allow public read access to all files in the bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'footprints' );

-- 2. Allow authenticated users to upload files
-- (Restricting to their own folder structure based on user_id is good practice but for simplicity we'll allow auth users to insert)
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'footprints' and auth.role() = 'authenticated' );

-- 3. Allow users to update/delete their own files (Optional, for future use)
create policy "Users can update their own files"
  on storage.objects for update
  using ( bucket_id = 'footprints' and auth.uid() = owner );

create policy "Users can delete their own files"
  on storage.objects for delete
  using ( bucket_id = 'footprints' and auth.uid() = owner );
