-- ============================================================
-- Football Clubs 10x — Stage 3: Match Center (results + MVP voting).
-- Additive & safe to re-run. (Analytics is computed in-app from existing data.)
-- ============================================================

-- Match result fields on sessions (used when kind = 'match') ------------------
alter table public.group_sessions add column if not exists opponent text;
alter table public.group_sessions add column if not exists score_us int;
alter table public.group_sessions add column if not exists score_them int;

-- MVP votes (one per voter per match) -----------------------------------------
create table if not exists public.match_mvp_votes (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.group_sessions(id) on delete cascade,
  group_id   uuid not null references public.groups(id) on delete cascade,
  voter_id   uuid not null references auth.users(id) on delete cascade,
  nominee_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (session_id, voter_id)
);
alter table public.match_mvp_votes enable row level security;
create index if not exists mvp_session_idx on public.match_mvp_votes(session_id);

drop policy if exists "mvp_select" on public.match_mvp_votes;
create policy "mvp_select" on public.match_mvp_votes for select
  using (public.is_group_owner(group_id) or public.is_group_member(group_id));
drop policy if exists "mvp_write_self" on public.match_mvp_votes;
create policy "mvp_write_self" on public.match_mvp_votes for all
  using (voter_id = auth.uid() and public.is_group_member(group_id))
  with check (voter_id = auth.uid() and public.is_group_member(group_id));

-- Teammates can see each other (names / numbers) — needed for MVP voting and a
-- team roster. Still no private data is exposed (only membership fields).
drop policy if exists "gmembers_select" on public.group_members;
create policy "gmembers_select" on public.group_members for select using (
  user_id = auth.uid() or public.is_group_owner(group_id) or public.is_group_member(group_id)
);
