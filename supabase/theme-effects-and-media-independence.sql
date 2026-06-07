alter table public.profiles add column if not exists display_name_effect text default 'none';
alter table public.community_themes add column if not exists display_name_effect text default 'none';

update public.profiles
set display_name_effect = coalesce(display_name_effect, 'none');

update public.community_themes
set display_name_effect = coalesce(display_name_effect, 'none');

notify pgrst, 'reload schema';
