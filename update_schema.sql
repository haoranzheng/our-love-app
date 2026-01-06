-- 1. 创建愿望清单表
create table if not exists wishlist (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  is_completed boolean default false,
  completed_at timestamp with time zone,
  user_id uuid references auth.users default auth.uid()
);

-- 开启 RLS
alter table wishlist enable row level security;

-- 愿望清单策略：允许用户操作自己的数据
create policy "Enable all access for users based on user_id"
on wishlist for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 2. 配置 Storage (存储桶)
-- 注意：Supabase Storage 的 SQL 配置比较复杂，通常建议在 Dashboard 操作。
-- 但我们可以尝试插入 storage.buckets 表（如果权限允许）。
-- 如果这段运行失败，请手动在 Supabase Dashboard -> Storage 创建一个名为 'love_images' 的 Public Bucket。

insert into storage.buckets (id, name, public)
values ('love_images', 'love_images', true)
on conflict (id) do nothing;

-- Storage 策略：允许登录用户上传和查看
create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'love_images' );

create policy "Allow public viewing"
on storage.objects for select
to public
using ( bucket_id = 'love_images' );

-- 允许用户删除自己的图片（可选）
create policy "Allow users to delete their own images"
on storage.objects for delete
to authenticated
using ( bucket_id = 'love_images' and owner = auth.uid() );
