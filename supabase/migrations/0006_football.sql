-- ============================================================
-- Football-first, Stage 1 (additive & safe to re-run).
-- Adds scalable roles to members, a Task model on group habits
-- (type / XP reward / deadline), and coach announcements.
-- Nothing here drops or rewrites existing columns, so it can run
-- on top of 0005 without touching current data.
-- ============================================================

-- Member roles ----------------------------------------------------------------
-- Roles are stored as free text (owner / admin / coach / assistant / player)
-- so new roles can be introduced later without a schema change. The group's
-- owner_id remains the source of truth for ownership; role adds granularity.
alter table public.group_members
  add column if not exists role text not null default 'player';

-- Tasks (group_habits become "tasks") -----------------------------------------
-- type: daily | weekly | onetime | photo | ai_photo | manual | timer | match | video | custom
-- xp:   points awarded per completion (drives the leaderboard)
-- due_date: optional YYYY-MM-DD deadline for one-time tasks
alter table public.group_habits
  add column if not exists type text not null default 'daily';
alter table public.group_habits
  add column if not exists xp int not null default 10;
alter table public.group_habits
  add column if not exists due_date text;

-- Announcements (coach -> team) ------------------------------------------------
create table if not exists public.group_announcements (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  author_id   uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  body        text not null default '',
  created_at  timestamptz not null default now()
);
alter table public.group_announcements enable row level security;

-- Owners write; owners and members read. Reuses the security-definer helpers
-- from 0005 so these policies never recurse into other tables' policies.
drop policy if exists "announce_select" on public.group_announcements;
create policy "announce_select" on public.group_announcements for select using (
  public.is_group_owner(group_id) or public.is_group_member(group_id)
);
drop policy if exists "announce_write" on public.group_announcements;
create policy "announce_write" on public.group_announcements for all
  using (public.is_group_owner(group_id))
  with check (public.is_group_owner(group_id) and author_id = auth.uid());

create index if not exists announce_group_idx
  on public.group_announcements(group_id, created_at desc);
