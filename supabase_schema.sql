-- 1. 创建纪念日事件表
create table love_events (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  event_date date not null,
  image_url text,
  user_id uuid references auth.users default auth.uid()
);

-- 2. 开启行级安全 (RLS)
alter table love_events enable row level security;

-- 3. 创建安全策略
-- 允许用户查看自己的数据
create policy "Enable all access for users based on user_id"
on love_events for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 说明：
-- 为了实现数据同步，请你和女朋友使用同一个账号登录。
-- 这样 auth.uid() 是一样的，你们就能看到相同的数据。
