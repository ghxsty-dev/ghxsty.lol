alter table public.profiles add column if not exists panel_radius integer default 8;
alter table public.profiles add column if not exists button_radius integer default 6;

update public.profiles
set
  panel_radius = coalesce(panel_radius, 8),
  button_radius = coalesce(button_radius, 6);

notify pgrst, 'reload schema';
