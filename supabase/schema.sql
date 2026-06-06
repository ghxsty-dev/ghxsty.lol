create extension if not exists pgcrypto;

create type public.profile_theme as enum (
  'dark',
  'light',
  'midnight',
  'cyberpunk',
  'anime',
  'glass'
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  bio text,
  avatar_url text,
  banner_url text,
  theme public.profile_theme not null default 'dark',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_-]{3,20}$'),
  constraint profiles_username_reserved check (
    username not in (
      'admin',
      'api',
      'dashboard',
      'login',
      'register',
      'settings',
      'support',
      'help',
      'root'
    )
  )
);

create table public.profile_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  url text not null,
  icon text,
  position integer not null default 0,
  constraint profile_links_title_length check (char_length(title) between 1 and 60),
  constraint profile_links_url_format check (url ~ '^https?://')
);

create index profile_links_profile_position_idx
  on public.profile_links(profile_id, position);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_username text;
begin
  requested_username := lower(coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)));

  if requested_username !~ '^[a-z0-9_-]{3,20}$'
    or requested_username in (
      'admin',
      'api',
      'dashboard',
      'login',
      'register',
      'settings',
      'support',
      'help',
      'root'
    )
  then
    requested_username := 'user_' || substr(new.id::text, 1, 8);
  end if;

  if exists (select 1 from public.profiles where username = requested_username) then
    requested_username := 'user_' || substr(new.id::text, 1, 8);
  end if;

  insert into public.profiles (user_id, username, display_name, theme)
  values (new.id, requested_username, requested_username, 'dark')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.profile_links enable row level security;

create policy "Profiles are public"
on public.profiles
for select
using (true);

create policy "Users insert their own profile"
on public.profiles
for insert
with check (auth.uid() = user_id);

create policy "Users update their own profile"
on public.profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users delete their own profile"
on public.profiles
for delete
using (auth.uid() = user_id);

create policy "Profile links are public"
on public.profile_links
for select
using (true);

create policy "Users insert links for their own profile"
on public.profile_links
for insert
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = profile_links.profile_id
      and profiles.user_id = auth.uid()
  )
);

create policy "Users update links for their own profile"
on public.profile_links
for update
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = profile_links.profile_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = profile_links.profile_id
      and profiles.user_id = auth.uid()
  )
);

create policy "Users delete links for their own profile"
on public.profile_links
for delete
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = profile_links.profile_id
      and profiles.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-media',
  'profile-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Profile media is public"
on storage.objects
for select
using (bucket_id = 'profile-media');

create policy "Users upload their own media"
on storage.objects
for insert
with check (
  bucket_id = 'profile-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users update their own media"
on storage.objects
for update
using (
  bucket_id = 'profile-media'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'profile-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users delete their own media"
on storage.objects
for delete
using (
  bucket_id = 'profile-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);
