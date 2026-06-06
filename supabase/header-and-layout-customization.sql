alter table public.profiles add column if not exists header_enabled boolean default true;
alter table public.profiles add column if not exists header_background_style text default 'gradient';
alter table public.profiles add column if not exists header_color text default '#74d9bf';
alter table public.profiles add column if not exists header_color_to text default '#2f9d8f';

update public.profiles
set
  header_enabled = coalesce(header_enabled, true),
  header_background_style = coalesce(header_background_style, 'gradient'),
  header_color = coalesce(header_color, '#74d9bf'),
  header_color_to = coalesce(header_color_to, '#2f9d8f');
