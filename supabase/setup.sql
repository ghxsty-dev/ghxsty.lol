create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'profile_theme') then
    create type public.profile_theme as enum (
      'dark',
      'light',
      'midnight',
      'cyberpunk',
      'anime',
      'glass'
    );
  end if;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  bio text,
  avatar_url text,
  banner_url text,
  music_url text,
  music_title text,
  music_show_volume boolean default true,
  music_volume_position text default 'top-right',
  accent_color text default '#ffffff',
  page_background_color text default '#050507',
  panel_background_color text default '#111113',
  text_color text default '#ffffff',
  muted_text_color text default '#d4d4d8',
  button_background_color text default '#ffffff',
  button_text_color text default '#ffffff',
  header_enabled boolean default true,
  header_background_style text default 'gradient',
  header_color text default '#74d9bf',
  header_color_to text default '#2f9d8f',
  panel_visible boolean default true,
  links_icon_only boolean default false,
  background_blur integer default 10,
  panel_opacity integer default 70,
  button_opacity integer default 12,
  background_style text default 'soft',
  button_style text default 'glass',
  font_style text default 'clean',
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

create table if not exists public.profile_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  url text not null,
  icon text,
  position integer not null default 0,
  constraint profile_links_title_length check (char_length(title) between 1 and 60),
  constraint profile_links_url_format check (url ~ '^https?://')
);

create index if not exists profile_links_profile_position_idx
  on public.profile_links(profile_id, position);

create table if not exists public.profile_votes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  value integer not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, user_id)
);

create index if not exists profile_votes_profile_idx
  on public.profile_votes(profile_id);

create index if not exists profile_votes_user_idx
  on public.profile_votes(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists profile_votes_set_updated_at on public.profile_votes;

create trigger profile_votes_set_updated_at
before update on public.profile_votes
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
alter table public.profile_votes enable row level security;

drop policy if exists "Profiles are public" on public.profiles;
drop policy if exists "Users insert their own profile" on public.profiles;
drop policy if exists "Users update their own profile" on public.profiles;
drop policy if exists "Users delete their own profile" on public.profiles;

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

drop policy if exists "Profile links are public" on public.profile_links;
drop policy if exists "Users insert links for their own profile" on public.profile_links;
drop policy if exists "Users update links for their own profile" on public.profile_links;
drop policy if exists "Users delete links for their own profile" on public.profile_links;

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

drop policy if exists "Users read their own votes" on public.profile_votes;
drop policy if exists "Users insert their own votes" on public.profile_votes;
drop policy if exists "Users update their own votes" on public.profile_votes;
drop policy if exists "Users delete their own votes" on public.profile_votes;

create policy "Users read their own votes"
on public.profile_votes
for select
using (auth.uid() = user_id);

create policy "Users insert their own votes"
on public.profile_votes
for insert
with check (auth.uid() = user_id);

create policy "Users update their own votes"
on public.profile_votes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users delete their own votes"
on public.profile_votes
for delete
using (auth.uid() = user_id);

create or replace view public.profile_vote_scores as
select
  profiles.id as profile_id,
  coalesce(count(profile_votes.id) filter (where profile_votes.value = 1), 0)::integer as upvotes,
  coalesce(count(profile_votes.id) filter (where profile_votes.value = -1), 0)::integer as downvotes,
  coalesce(sum(profile_votes.value), 0)::integer as score
from public.profiles
left join public.profile_votes on profile_votes.profile_id = profiles.id
group by profiles.id;

grant select on public.profile_vote_scores to anon, authenticated;

alter table public.profiles add column if not exists music_url text;
alter table public.profiles add column if not exists music_title text;
alter table public.profiles add column if not exists music_show_volume boolean default true;
alter table public.profiles add column if not exists music_volume_position text default 'top-right';
alter table public.profiles add column if not exists accent_color text default '#ffffff';
alter table public.profiles add column if not exists page_background_color text default '#050507';
alter table public.profiles add column if not exists panel_background_color text default '#111113';
alter table public.profiles add column if not exists text_color text default '#ffffff';
alter table public.profiles add column if not exists muted_text_color text default '#d4d4d8';
alter table public.profiles add column if not exists button_background_color text default '#ffffff';
alter table public.profiles add column if not exists button_text_color text default '#ffffff';
alter table public.profiles add column if not exists header_enabled boolean default true;
alter table public.profiles add column if not exists header_background_style text default 'gradient';
alter table public.profiles add column if not exists header_color text default '#74d9bf';
alter table public.profiles add column if not exists header_color_to text default '#2f9d8f';
alter table public.profiles add column if not exists panel_visible boolean default true;
alter table public.profiles add column if not exists links_icon_only boolean default false;
alter table public.profiles add column if not exists background_blur integer default 10;
alter table public.profiles add column if not exists panel_opacity integer default 70;
alter table public.profiles add column if not exists button_opacity integer default 12;
alter table public.profiles add column if not exists background_style text default 'soft';
alter table public.profiles add column if not exists button_style text default 'glass';
alter table public.profiles add column if not exists font_style text default 'clean';

insert into public.profiles (user_id, username, display_name, theme)
select
  users.id,
  case
    when lower(coalesce(users.raw_user_meta_data->>'username', '')) ~ '^[a-z0-9_-]{3,20}$'
      and lower(coalesce(users.raw_user_meta_data->>'username', '')) not in (
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
      and not exists (
        select 1
        from public.profiles existing
        where existing.username = lower(users.raw_user_meta_data->>'username')
      )
    then lower(users.raw_user_meta_data->>'username')
    else 'user_' || substr(users.id::text, 1, 8)
  end as username,
  case
    when lower(coalesce(users.raw_user_meta_data->>'username', '')) ~ '^[a-z0-9_-]{3,20}$'
    then lower(users.raw_user_meta_data->>'username')
    else 'user_' || substr(users.id::text, 1, 8)
  end as display_name,
  'dark'
from auth.users
where not exists (
  select 1
  from public.profiles
  where profiles.user_id = users.id
)
on conflict (user_id) do nothing;
