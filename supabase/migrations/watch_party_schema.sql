create extension if not exists pgcrypto;

alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists avatar_decoration_url text;
alter table public.profiles add column if not exists name_effect text not null default 'none';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'moderator', 'admin'));

alter table public.profiles
  drop constraint if exists profiles_name_effect_check;

alter table public.profiles
  add constraint profiles_name_effect_check check (name_effect in ('none', 'glow', 'gradient', 'neon', 'sparkle'));

update public.profiles
set
  role = case when is_admin = true or username = 'ghxsty' then 'admin' else coalesce(role, 'user') end,
  name_effect = case
    when coalesce(display_name_effect, '') like '%neon%' then 'neon'
    when coalesce(display_name_effect, '') like '%gradient%' or display_name_effect = 'fire' then 'gradient'
    when display_name_effect in ('shine', 'sparkle') then 'sparkle'
    when display_name_effect in ('pulse', 'glitch', 'float') then 'glow'
    else coalesce(name_effect, 'none')
  end;

update public.profiles
set avatar_decoration_url = avatar_decorations.image_url
from public.avatar_decorations
where profiles.avatar_decoration_id = avatar_decorations.id
  and profiles.avatar_decoration_url is null;

create or replace function public.is_moderator_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and (profiles.role in ('moderator', 'admin') or profiles.is_admin = true)
  );
$$;

create or replace function public.prevent_role_self_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role and not public.is_moderator_or_admin() then
    raise exception 'Role cannot be changed by this user.';
  end if;

  return new;
end;
$$;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text,
  video_storage_key text,
  thumbnail_url text,
  status text not null default 'draft',
  is_playing boolean not null default false,
  playback_position double precision not null default 0,
  playback_updated_at timestamptz not null default now(),
  starts_at timestamptz,
  ended_at timestamptz,
  delete_after timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_title_length check (char_length(title) between 3 and 120),
  constraint events_description_length check (description is null or char_length(description) <= 1000),
  constraint events_status_check check (status in ('draft', 'scheduled', 'live', 'ended', 'deleted')),
  constraint events_position_check check (playback_position >= 0)
);

create table if not exists public.event_commands (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  type text not null,
  position double precision,
  payload jsonb,
  created_by uuid references auth.users(id) on delete set null,
  sent_at timestamptz not null default now(),
  constraint event_commands_type_check check (type in ('play', 'pause', 'seek', 'end', 'announcement', 'poll_created', 'poll_closed'))
);

create table if not exists public.event_messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  message_type text not null default 'text',
  gif_url text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint event_messages_length check (char_length(trim(message)) between 1 and 500),
  constraint event_messages_no_html check (message !~ '<[^>]*>'),
  constraint event_messages_type_check check (message_type in ('text', 'gif')),
  constraint event_messages_gif_url_check check (
    (message_type = 'text' and gif_url is null)
    or
    (message_type = 'gif' and gif_url ~ '^https://')
  )
);

alter table public.event_messages
  drop constraint if exists event_messages_user_profile_fkey;

alter table public.event_messages
  add constraint event_messages_user_profile_fkey
  foreign key (user_id)
  references public.profiles(user_id)
  on delete cascade;

create table if not exists public.event_announcements (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  content text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint event_announcements_title_length check (char_length(title) between 1 and 120),
  constraint event_announcements_content_length check (char_length(content) between 1 and 1000)
);

create table if not exists public.event_polls (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  question text not null,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  constraint event_polls_question_length check (char_length(question) between 3 and 200)
);

create table if not exists public.event_poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.event_polls(id) on delete cascade,
  option_text text not null,
  position integer not null default 0,
  constraint event_poll_options_text_length check (char_length(option_text) between 1 and 120)
);

create table if not exists public.event_poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.event_polls(id) on delete cascade,
  option_id uuid not null references public.event_poll_options(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (poll_id, user_id)
);

create table if not exists public.username_change_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  old_username text not null,
  new_username text not null,
  changed_at timestamptz not null default now()
);

create index if not exists events_status_starts_idx on public.events(status, starts_at);
create index if not exists event_messages_event_created_idx on public.event_messages(event_id, created_at);
create index if not exists event_commands_event_sent_idx on public.event_commands(event_id, sent_at);
create index if not exists event_announcements_event_created_idx on public.event_announcements(event_id, created_at);
create index if not exists event_polls_event_created_idx on public.event_polls(event_id, created_at);
create index if not exists username_change_logs_profile_time_idx on public.username_change_logs(profile_id, changed_at);

create or replace function public.is_moderator_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.user_id = auth.uid()
      and (profiles.role in ('moderator', 'admin') or profiles.is_admin = true)
  );
$$;

drop trigger if exists profiles_prevent_role_self_change on public.profiles;
create trigger profiles_prevent_role_self_change
before update on public.profiles
for each row execute function public.prevent_role_self_change();

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

create or replace function public.can_vote_event_poll(target_poll_id uuid, target_option_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.event_polls
      join public.event_poll_options on event_poll_options.poll_id = event_polls.id
      where event_polls.id = target_poll_id
        and event_poll_options.id = target_option_id
        and event_polls.is_active = true
        and event_polls.closed_at is null
    );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists event_messages_protect_update on public.event_messages;
create trigger event_messages_protect_update
before update on public.event_messages
for each row execute function public.protect_event_message_update();

alter table public.events enable row level security;
alter table public.event_commands enable row level security;
alter table public.event_messages enable row level security;
alter table public.event_announcements enable row level security;
alter table public.event_polls enable row level security;
alter table public.event_poll_options enable row level security;
alter table public.event_poll_votes enable row level security;
alter table public.username_change_logs enable row level security;

drop policy if exists "Public can read visible events" on public.events;
drop policy if exists "Mods manage events" on public.events;
create policy "Public can read visible events"
on public.events
for select
using (status in ('scheduled', 'live', 'ended'));

create policy "Mods manage events"
on public.events
for all
using (public.is_moderator_or_admin())
with check (public.is_moderator_or_admin());

drop policy if exists "Public can read event commands" on public.event_commands;
drop policy if exists "Mods write event commands" on public.event_commands;
create policy "Public can read event commands"
on public.event_commands
for select
using (true);

create policy "Mods write event commands"
on public.event_commands
for insert
with check (public.is_moderator_or_admin());

drop policy if exists "Public can read event messages" on public.event_messages;
drop policy if exists "Users send event messages" on public.event_messages;
drop policy if exists "Users delete own event messages" on public.event_messages;
drop policy if exists "Mods update event messages" on public.event_messages;
create policy "Public can read event messages"
on public.event_messages
for select
using (deleted_at is null or public.is_moderator_or_admin() or user_id = auth.uid());

create policy "Users send event messages"
on public.event_messages
for insert
with check (
  user_id = auth.uid()
  and public.can_send_event_message(event_id, message)
);

create policy "Users delete own event messages"
on public.event_messages
for update
using (user_id = auth.uid() or public.is_moderator_or_admin())
with check (user_id = auth.uid() or public.is_moderator_or_admin());

drop policy if exists "Public can read announcements" on public.event_announcements;
drop policy if exists "Mods manage announcements" on public.event_announcements;
create policy "Public can read announcements"
on public.event_announcements
for select
using (true);

create policy "Mods manage announcements"
on public.event_announcements
for all
using (public.is_moderator_or_admin())
with check (public.is_moderator_or_admin());

drop policy if exists "Public can read polls" on public.event_polls;
drop policy if exists "Mods manage polls" on public.event_polls;
create policy "Public can read polls"
on public.event_polls
for select
using (true);

create policy "Mods manage polls"
on public.event_polls
for all
using (public.is_moderator_or_admin())
with check (public.is_moderator_or_admin());

drop policy if exists "Public can read poll options" on public.event_poll_options;
drop policy if exists "Mods manage poll options" on public.event_poll_options;
create policy "Public can read poll options"
on public.event_poll_options
for select
using (true);

create policy "Mods manage poll options"
on public.event_poll_options
for all
using (public.is_moderator_or_admin())
with check (public.is_moderator_or_admin());

drop policy if exists "Users read poll votes" on public.event_poll_votes;
drop policy if exists "Users create poll votes" on public.event_poll_votes;
create policy "Users read poll votes"
on public.event_poll_votes
for select
using (true);

create policy "Users create poll votes"
on public.event_poll_votes
for insert
with check (
  user_id = auth.uid()
  and public.can_vote_event_poll(poll_id, option_id)
);

drop policy if exists "Users read own username logs" on public.username_change_logs;
drop policy if exists "Users create own username logs" on public.username_change_logs;
create policy "Users read own username logs"
on public.username_change_logs
for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = username_change_logs.profile_id
      and profiles.user_id = auth.uid()
  )
);

create policy "Users create own username logs"
on public.username_change_logs
for insert
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = username_change_logs.profile_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile"
on public.profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Admins update any profile" on public.profiles;
create policy "Admins update any profile"
on public.profiles
for update
using (public.is_moderator_or_admin())
with check (public.is_moderator_or_admin());

grant execute on function public.is_moderator_or_admin() to anon, authenticated;
grant execute on function public.can_send_event_message(uuid, text) to authenticated;
grant execute on function public.can_vote_event_poll(uuid, uuid) to authenticated;

do $$
begin
  begin alter publication supabase_realtime add table public.events; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.event_commands; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.event_messages; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.event_announcements; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.event_polls; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.event_poll_options; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.event_poll_votes; exception when duplicate_object then null; end;
end;
$$;

notify pgrst, 'reload schema';
