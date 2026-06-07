alter table public.profiles add column if not exists music_title text;
alter table public.profiles add column if not exists music_show_volume boolean default true;
alter table public.profiles add column if not exists music_volume_position text default 'top-right';

update public.profiles
set
  music_show_volume = coalesce(music_show_volume, true),
  music_volume_position = coalesce(music_volume_position, 'top-right');

notify pgrst, 'reload schema';
