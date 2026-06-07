alter table public.profiles add column if not exists music_url text;
alter table public.profiles add column if not exists is_admin boolean default false;
alter table public.profiles add column if not exists view_count integer not null default 0;
alter table public.profiles add column if not exists avatar_decoration_id uuid;
alter table public.profiles add column if not exists discord_id text;
alter table public.profiles add column if not exists discord_username text;
alter table public.profiles add column if not exists discord_global_name text;
alter table public.profiles add column if not exists discord_avatar_url text;
alter table public.profiles add column if not exists discord_banner_url text;
alter table public.profiles add column if not exists discord_accent_color integer;
alter table public.profiles add column if not exists discord_show_presence boolean default true;
alter table public.profiles add column if not exists discord_connected_at timestamptz;
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
alter table public.profiles add column if not exists panel_radius integer default 8;
alter table public.profiles add column if not exists button_radius integer default 6;
alter table public.profiles add column if not exists background_style text default 'soft';
alter table public.profiles add column if not exists button_style text default 'glass';
alter table public.profiles add column if not exists font_style text default 'clean';
alter table public.profiles add column if not exists display_name_effect text default 'none';

create table if not exists public.avatar_decorations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  image_url text not null,
  is_active boolean not null default true,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint avatar_decorations_name_length check (char_length(name) between 2 and 40),
  constraint avatar_decorations_image_url_check check (
    image_url ~ '^https?://' or image_url ~ '^/avatar-decorations/'
  )
);

alter table public.profiles
  drop constraint if exists profiles_avatar_decoration_id_fkey;

alter table public.profiles
  add constraint profiles_avatar_decoration_id_fkey
  foreign key (avatar_decoration_id)
  references public.avatar_decorations(id)
  on delete set null;

alter table public.avatar_decorations enable row level security;

drop trigger if exists avatar_decorations_set_updated_at on public.avatar_decorations;

create trigger avatar_decorations_set_updated_at
before update on public.avatar_decorations
for each row execute function public.set_updated_at();

drop policy if exists "Avatar decorations are public" on public.avatar_decorations;
drop policy if exists "Admins insert avatar decorations" on public.avatar_decorations;
drop policy if exists "Admins update avatar decorations" on public.avatar_decorations;
drop policy if exists "Admins delete avatar decorations" on public.avatar_decorations;

create policy "Avatar decorations are public"
on public.avatar_decorations
for select
using (true);

create policy "Admins insert avatar decorations"
on public.avatar_decorations
for insert
with check (
  exists (
    select 1
    from public.profiles admin_profiles
    where admin_profiles.user_id = auth.uid()
      and (admin_profiles.is_admin = true or admin_profiles.username = 'ghxsty')
  )
);

create policy "Admins update avatar decorations"
on public.avatar_decorations
for update
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

create policy "Admins delete avatar decorations"
on public.avatar_decorations
for delete
using (
  exists (
    select 1
    from public.profiles admin_profiles
    where admin_profiles.user_id = auth.uid()
      and (admin_profiles.is_admin = true or admin_profiles.username = 'ghxsty')
  )
);

insert into public.avatar_decorations (name, image_url, is_active)
values
  ('Neon Crown', '/avatar-decorations/neon-crown.svg', true),
  ('Crystal Orbit', '/avatar-decorations/crystal-orbit.svg', true),
  ('Inferno Halo', '/avatar-decorations/inferno-halo.svg', true),
  ('Void Stars', '/avatar-decorations/void-stars.svg', true)
on conflict (name) do update
set
  image_url = excluded.image_url,
  is_active = excluded.is_active,
  updated_at = now();

create unique index if not exists profiles_discord_id_unique
  on public.profiles(discord_id)
  where discord_id is not null;

update public.profiles
set is_admin = true
where username = 'ghxsty';

update public.profiles
set
  music_show_volume = coalesce(music_show_volume, true),
  music_volume_position = coalesce(music_volume_position, 'top-right'),
  discord_show_presence = coalesce(discord_show_presence, true),
  accent_color = coalesce(accent_color, '#ffffff'),
  page_background_color = coalesce(page_background_color, '#050507'),
  panel_background_color = coalesce(panel_background_color, '#111113'),
  text_color = coalesce(text_color, '#ffffff'),
  muted_text_color = coalesce(muted_text_color, '#d4d4d8'),
  button_background_color = coalesce(button_background_color, '#ffffff'),
  button_text_color = coalesce(button_text_color, '#ffffff'),
  header_enabled = coalesce(header_enabled, true),
  header_background_style = coalesce(header_background_style, 'gradient'),
  header_color = coalesce(header_color, '#74d9bf'),
  header_color_to = coalesce(header_color_to, '#2f9d8f'),
  panel_visible = coalesce(panel_visible, true),
  links_icon_only = coalesce(links_icon_only, false),
  background_blur = coalesce(background_blur, 10),
  panel_opacity = coalesce(panel_opacity, 70),
  button_opacity = coalesce(button_opacity, 12),
  panel_radius = coalesce(panel_radius, 8),
  button_radius = coalesce(button_radius, 6),
  background_style = coalesce(background_style, 'soft'),
  button_style = coalesce(button_style, 'glass'),
  font_style = coalesce(font_style, 'clean'),
  display_name_effect = coalesce(display_name_effect, 'none');

notify pgrst, 'reload schema';
