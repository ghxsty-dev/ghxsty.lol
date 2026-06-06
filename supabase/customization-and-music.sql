alter table public.profiles add column if not exists music_url text;
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

update public.profiles
set
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
  background_style = coalesce(background_style, 'soft'),
  button_style = coalesce(button_style, 'glass'),
  font_style = coalesce(font_style, 'clean');

update storage.buckets
set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/ogg',
    'audio/webm',
    'audio/mp4',
    'audio/m4a',
    'audio/x-m4a',
    'application/octet-stream'
  ]
where id = 'profile-media';
