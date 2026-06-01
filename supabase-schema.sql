-- PromptVault Database Schema
-- Run this in the Supabase SQL Editor (supabase.com → your project → SQL Editor)

-- 1. Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text not null default 'user',  -- 'user' or 'admin'
  created_at timestamp with time zone default now()
);

-- 2. Prompts table
create table if not exists public.prompts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null default '',
  content text not null,
  content2 text,
  content3 text,
  content4 text,
  content5 text,
  content6 text,
  content7 text,
  instructions text,
  category text not null default 'Other',
  tags text[] default '{}',
  tools text[] default '{}',
  tested_models text[] default '{}',
  youtube_url text,
  author text not null default 'Admin',
  likes integer not null default 0,
  copy_count integer not null default 0,
  created_at timestamp with time zone default now()
);

-- 3. Favorites table
create table if not exists public.favorites (
  user_id uuid references auth.users on delete cascade,
  prompt_id uuid references public.prompts on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, prompt_id)
);

-- 4. Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.prompts enable row level security;
alter table public.favorites enable row level security;

-- 5. RLS Policies

-- Profiles: users can read/update their own
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Prompts: anyone can read
create policy "Anyone can read prompts"
  on public.prompts for select using (true);

-- Prompts: only admins can write
create policy "Admins can insert prompts"
  on public.prompts for insert
  with check (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Admins can update prompts"
  on public.prompts for update using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Admins can delete prompts"
  on public.prompts for delete using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- Favorites: users manage their own
create policy "Users can manage own favorites"
  on public.favorites for all using (auth.uid() = user_id);

-- 6. Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Function: increment copy count (called anonymously)
create or replace function public.increment_copy_count(prompt_id uuid)
returns void as $$
  update public.prompts set copy_count = copy_count + 1 where id = prompt_id;
$$ language sql security definer;

-- =============================================
-- AFTER RUNNING THIS SCHEMA:
-- 1. Go to Authentication → Providers → enable Email and Google
-- 2. Sign up with your email in the app
-- 3. In Supabase → Table Editor → profiles → find your row → change role to 'admin'
-- =============================================
