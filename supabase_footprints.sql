-- Create footprints table
create table public.footprints (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  latitude double precision not null,
  longitude double precision not null,
  visit_date date not null,
  image_url text,
  user_id uuid references auth.users not null
);

-- Enable RLS
alter table public.footprints enable row level security;

-- Policies
create policy "Enable read access for authenticated users"
  on public.footprints for select
  to authenticated
  using (true);

create policy "Enable insert for authenticated users"
  on public.footprints for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Enable delete for users based on user_id"
  on public.footprints for delete
  to authenticated
  using (auth.uid() = user_id);

-- Storage bucket for footprint images
insert into storage.buckets (id, name, public) 
values ('footprint_images', 'footprint_images', true)
on conflict (id) do nothing;

create policy "Give public access to footprint_images"
  on storage.objects for select
  to public
  using (bucket_id = 'footprint_images');

create policy "Enable upload for authenticated users to footprint_images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'footprint_images');
