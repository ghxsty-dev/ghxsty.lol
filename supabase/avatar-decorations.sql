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
  add column if not exists avatar_decoration_id uuid references public.avatar_decorations(id) on delete set null;

drop trigger if exists avatar_decorations_set_updated_at on public.avatar_decorations;

create trigger avatar_decorations_set_updated_at
before update on public.avatar_decorations
for each row execute function public.set_updated_at();

alter table public.avatar_decorations enable row level security;

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

notify pgrst, 'reload schema';
