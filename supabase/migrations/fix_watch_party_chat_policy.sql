create or replace function public.can_send_event_message(target_event_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return false;
  end if;

  if public.is_moderator_or_admin() then
    return exists (
      select 1 from public.events
      where id = target_event_id
        and status <> 'deleted'
    );
  end if;

  if not exists (
    select 1 from public.events
    where id = target_event_id
      and status = 'live'
  ) then
    return false;
  end if;

  return not exists (
    select 1
    from public.event_messages
    where event_messages.user_id = auth.uid()
      and event_messages.created_at > now() - interval '3 seconds'
  );
end;
$$;

grant execute on function public.can_send_event_message(uuid) to authenticated;
notify pgrst, 'reload schema';
