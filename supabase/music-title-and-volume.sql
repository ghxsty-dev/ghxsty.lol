alter table public.profiles add column if not exists music_title text;
alter table public.profiles add column if not exists music_show_volume boolean default true;

update public.profiles
set music_show_volume = coalesce(music_show_volume, true);

notify pgrst, 'reload schema';
