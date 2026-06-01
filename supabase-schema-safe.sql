-- Safe version: drops existing policies before recreating them

-- 1. Tables (safe to re-run)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text not null default 'user',
  created_at timestamp with time zone default now()
);

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

create table if not exists public.favorites (
  user_id uuid references auth.users on delete cascade,
  prompt_id uuid references public.prompts on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, prompt_id)
);

-- 2. Enable RLS
alter table public.profiles enable row level security;
alter table public.prompts enable row level security;
alter table public.favorites enable row level security;

-- 3. Drop existing policies (ignore errors if they don't exist)
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Anyone can read prompts" on public.prompts;
drop policy if exists "Admins can insert prompts" on public.prompts;
drop policy if exists "Admins can update prompts" on public.prompts;
drop policy if exists "Admins can delete prompts" on public.prompts;
drop policy if exists "Users can manage own favorites" on public.favorites;

-- 4. Recreate policies
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Anyone can read prompts"
  on public.prompts for select using (true);

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

create policy "Users can manage own favorites"
  on public.favorites for all using (auth.uid() = user_id);

-- 5. Trigger for auto-creating profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Copy count function
create or replace function public.increment_copy_count(prompt_id uuid)
returns void as $$
  update public.prompts set copy_count = copy_count + 1 where id = prompt_id;
$$ language sql security definer;
