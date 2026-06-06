alter table public.profiles add column if not exists panel_visible boolean default true;
alter table public.profiles add column if not exists links_icon_only boolean default false;

update public.profiles
set
  panel_visible = coalesce(panel_visible, true),
  links_icon_only = coalesce(links_icon_only, false);

notify pgrst, 'reload schema';
