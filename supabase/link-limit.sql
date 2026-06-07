create or replace function public.enforce_profile_link_limit()
returns trigger
language plpgsql
as $$
begin
  if (
    select count(*)
    from public.profile_links
    where profile_id = new.profile_id
  ) >= 12 then
    raise exception 'En fazla 12 link eklenebilir.';
  end if;

  return new;
end;
$$;

drop trigger if exists profile_links_limit_before_insert on public.profile_links;

create trigger profile_links_limit_before_insert
before insert on public.profile_links
for each row execute function public.enforce_profile_link_limit();
