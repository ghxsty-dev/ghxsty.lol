alter table public.profiles add column if not exists discord_id text;
alter table public.profiles add column if not exists discord_username text;
alter table public.profiles add column if not exists discord_global_name text;
alter table public.profiles add column if not exists discord_avatar_url text;
alter table public.profiles add column if not exists discord_banner_url text;
alter table public.profiles add column if not exists discord_accent_color integer;
alter table public.profiles add column if not exists discord_show_presence boolean default true;
alter table public.profiles add column if not exists discord_connected_at timestamptz;

create unique index if not exists profiles_discord_id_unique
  on public.profiles(discord_id)
  where discord_id is not null;

update public.profiles
set discord_show_presence = coalesce(discord_show_presence, true);

notify pgrst, 'reload schema';
