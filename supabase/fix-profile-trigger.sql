create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_username text;
begin
  requested_username := lower(coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)));

  if requested_username !~ '^[a-z0-9_-]{3,20}$'
    or requested_username in (
      'admin',
      'api',
      'dashboard',
      'login',
      'register',
      'settings',
      'support',
      'help',
      'root'
    )
  then
    requested_username := 'user_' || substr(new.id::text, 1, 8);
  end if;

  if exists (select 1 from public.profiles where username = requested_username) then
    requested_username := 'user_' || substr(new.id::text, 1, 8);
  end if;

  insert into public.profiles (user_id, username, display_name, theme)
  values (new.id, requested_username, requested_username, 'dark')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (user_id, username, display_name, theme)
select
  users.id,
  case
    when lower(coalesce(users.raw_user_meta_data->>'username', '')) ~ '^[a-z0-9_-]{3,20}$'
      and lower(coalesce(users.raw_user_meta_data->>'username', '')) not in (
        'admin',
        'api',
        'dashboard',
        'login',
        'register',
        'settings',
        'support',
        'help',
        'root'
      )
      and not exists (
        select 1
        from public.profiles existing
        where existing.username = lower(users.raw_user_meta_data->>'username')
      )
    then lower(users.raw_user_meta_data->>'username')
    else 'user_' || substr(users.id::text, 1, 8)
  end as username,
  case
    when lower(coalesce(users.raw_user_meta_data->>'username', '')) ~ '^[a-z0-9_-]{3,20}$'
    then lower(users.raw_user_meta_data->>'username')
    else 'user_' || substr(users.id::text, 1, 8)
  end as display_name,
  'dark'
from auth.users
where not exists (
  select 1
  from public.profiles
  where profiles.user_id = users.id
)
on conflict (user_id) do nothing;
