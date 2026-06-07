alter table public.profiles add column if not exists view_count integer not null default 0;

create or replace function public.increment_profile_view(target_profile_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  update public.profiles
  set view_count = coalesce(view_count, 0) + 1
  where id = target_profile_id
  returning view_count into new_count;

  return coalesce(new_count, 0);
end;
$$;

grant execute on function public.increment_profile_view(uuid) to anon, authenticated;

notify pgrst, 'reload schema';
