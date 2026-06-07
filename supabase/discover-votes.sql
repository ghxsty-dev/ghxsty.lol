create table if not exists public.profile_votes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  value integer not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, user_id)
);

create index if not exists profile_votes_profile_idx
  on public.profile_votes(profile_id);

create index if not exists profile_votes_user_idx
  on public.profile_votes(user_id);

drop trigger if exists profile_votes_set_updated_at on public.profile_votes;

create trigger profile_votes_set_updated_at
before update on public.profile_votes
for each row execute function public.set_updated_at();

alter table public.profile_votes enable row level security;

drop policy if exists "Users read their own votes" on public.profile_votes;
drop policy if exists "Users insert their own votes" on public.profile_votes;
drop policy if exists "Users update their own votes" on public.profile_votes;
drop policy if exists "Users delete their own votes" on public.profile_votes;

create policy "Users read their own votes"
on public.profile_votes
for select
using (auth.uid() = user_id);

create policy "Users insert their own votes"
on public.profile_votes
for insert
with check (auth.uid() = user_id);

create policy "Users update their own votes"
on public.profile_votes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users delete their own votes"
on public.profile_votes
for delete
using (auth.uid() = user_id);

create or replace view public.profile_vote_scores as
select
  profiles.id as profile_id,
  coalesce(count(profile_votes.id) filter (where profile_votes.value = 1), 0)::integer as upvotes,
  coalesce(count(profile_votes.id) filter (where profile_votes.value = -1), 0)::integer as downvotes,
  coalesce(sum(profile_votes.value), 0)::integer as score
from public.profiles
left join public.profile_votes on profile_votes.profile_id = profiles.id
group by profiles.id;

grant select on public.profile_vote_scores to anon, authenticated;

notify pgrst, 'reload schema';
