-- Run this in Supabase SQL Editor to add new tables

-- 1. Access requests (from non-users wanting access)
create table if not exists public.access_requests (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  reason text,
  status text not null default 'pending', -- 'pending', 'approved', 'rejected'
  created_at timestamptz default now()
);

-- 2. Claude Skills
create table if not exists public.skills (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null default '',
  content text not null,
  file_name text not null,
  category text not null default 'General',
  download_count integer not null default 0,
  created_at timestamptz default now()
);

-- 3. Activity log
create table if not exists public.activity_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  user_email text,
  action text not null,
  resource_id text,
  resource_name text,
  created_at timestamptz default now()
);

-- RLS for access_requests
alter table public.access_requests enable row level security;
drop policy if exists "Anyone can submit access request" on public.access_requests;
drop policy if exists "Authenticated can view access requests" on public.access_requests;
drop policy if exists "Authenticated can update access requests" on public.access_requests;

create policy "Anyone can submit access request"
  on public.access_requests for insert with check (true);
create policy "Authenticated can view access requests"
  on public.access_requests for select using (auth.role() = 'authenticated');
create policy "Authenticated can update access requests"
  on public.access_requests for update using (auth.role() = 'authenticated');

-- RLS for skills (logged-in users only)
alter table public.skills enable row level security;
drop policy if exists "Authenticated users can read skills" on public.skills;
drop policy if exists "Authenticated can manage skills" on public.skills;

create policy "Authenticated users can read skills"
  on public.skills for select using (auth.role() = 'authenticated');
create policy "Authenticated can manage skills"
  on public.skills for all using (auth.role() = 'authenticated');

-- RLS for activity_log
alter table public.activity_log enable row level security;
drop policy if exists "Anyone can insert activity" on public.activity_log;
drop policy if exists "Authenticated can view activity" on public.activity_log;

create policy "Anyone can insert activity"
  on public.activity_log for insert with check (true);
create policy "Authenticated can view activity"
  on public.activity_log for select using (auth.role() = 'authenticated');

-- Function: increment skill download count
create or replace function public.increment_skill_download(skill_id uuid)
returns void as $$
  update public.skills set download_count = download_count + 1 where id = skill_id;
$$ language sql security definer;
