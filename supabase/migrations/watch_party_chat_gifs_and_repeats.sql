alter table public.event_messages add column if not exists message_type text not null default 'text';
alter table public.event_messages add column if not exists gif_url text;

alter table public.event_messages
  drop constraint if exists event_messages_type_check;

alter table public.event_messages
  add constraint event_messages_type_check check (message_type in ('text', 'gif'));

alter table public.event_messages
  drop constraint if exists event_messages_gif_url_check;

alter table public.event_messages
  add constraint event_messages_gif_url_check check (
    (message_type = 'text' and gif_url is null)
    or
    (message_type = 'gif' and gif_url ~ '^https://')
  );

create or replace function public.can_send_event_message(target_event_id uuid, next_message text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_message text;
  repeated_count integer;
begin
  if auth.uid() is null then
    return false;
  end if;

  normalized_message := lower(trim(coalesce(next_message, '')));

  select count(*)
  into repeated_count
  from (
    select lower(trim(event_messages.message)) as recent_message
    from public.event_messages
    where event_messages.user_id = auth.uid()
      and event_messages.deleted_at is null
    order by event_messages.created_at desc
    limit 2
  ) recent
  where recent.recent_message = normalized_message;

  if repeated_count >= 2 then
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

drop policy if exists "Users send event messages" on public.event_messages;
create policy "Users send event messages"
on public.event_messages
for insert
with check (
  user_id = auth.uid()
  and public.can_send_event_message(event_id, message)
);

create or replace function public.protect_event_message_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_moderator_or_admin() then
    return new;
  end if;

  if old.event_id is distinct from new.event_id
    or old.user_id is distinct from new.user_id
    or old.message is distinct from new.message
    or old.message_type is distinct from new.message_type
    or old.gif_url is distinct from new.gif_url
    or old.created_at is distinct from new.created_at
  then
    raise exception 'Only message deletion is allowed.';
  end if;

  if old.deleted_at is not null or new.deleted_at is null then
    raise exception 'Only message deletion is allowed.';
  end if;

  return new;
end;
$$;

grant execute on function public.can_send_event_message(uuid, text) to authenticated;
notify pgrst, 'reload schema';
