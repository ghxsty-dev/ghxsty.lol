alter table public.profiles add column if not exists is_admin boolean default false;

update public.profiles
set is_admin = true
where username = 'ghxsty';

create table if not exists public.community_themes (
  id uuid primary key default gen_random_uuid(),
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'pending',
  banner_url text,
  music_url text,
  music_title text,
  music_show_volume boolean default true,
  music_volume_position text default 'top-right',
  theme public.profile_theme not null default 'dark',
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
  panel_radius integer default 8,
  button_radius integer default 6,
  background_style text default 'soft',
  button_style text default 'glass',
  font_style text default 'clean',
  display_name_effect text default 'none',
  approved_by_profile_id uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_themes_name_length check (char_length(name) between 3 and 40),
  constraint community_themes_description_length check (description is null or char_length(description) <= 160),
  constraint community_themes_status_check check (status in ('pending', 'approved', 'rejected'))
);

create index if not exists community_themes_status_idx
  on public.community_themes(status, approved_at desc);

create index if not exists community_themes_author_idx
  on public.community_themes(author_profile_id, created_at desc);

drop trigger if exists community_themes_set_updated_at on public.community_themes;

create trigger community_themes_set_updated_at
before update on public.community_themes
for each row execute function public.set_updated_at();

alter table public.community_themes enable row level security;

drop policy if exists "Approved community themes are public" on public.community_themes;
drop policy if exists "Users read their own community themes" on public.community_themes;
drop policy if exists "Users submit their own community themes" on public.community_themes;
drop policy if exists "Admins manage community themes" on public.community_themes;

create policy "Approved community themes are public"
on public.community_themes
for select
using (status = 'approved');

create policy "Users read their own community themes"
on public.community_themes
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = community_themes.author_profile_id
      and profiles.user_id = auth.uid()
  )
);

create policy "Users submit their own community themes"
on public.community_themes
for insert
to authenticated
with check (
  status = 'pending'
  and exists (
    select 1
    from public.profiles
    where profiles.id = community_themes.author_profile_id
      and profiles.user_id = auth.uid()
  )
);

create policy "Admins manage community themes"
on public.community_themes
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and (profiles.is_admin = true or profiles.username = 'ghxsty')
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and (profiles.is_admin = true or profiles.username = 'ghxsty')
  )
);

drop policy if exists "Admins update any profile" on public.profiles;

create policy "Admins update any profile"
on public.profiles
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles admin_profiles
    where admin_profiles.user_id = auth.uid()
      and (admin_profiles.is_admin = true or admin_profiles.username = 'ghxsty')
  )
)
with check (
  exists (
    select 1
    from public.profiles admin_profiles
    where admin_profiles.user_id = auth.uid()
      and (admin_profiles.is_admin = true or admin_profiles.username = 'ghxsty')
  )
);

notify pgrst, 'reload schema';
