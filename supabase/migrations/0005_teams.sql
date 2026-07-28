-- ============================================================
-- Teams / coaches: groups, members, group habits & completions.
-- Coaches own groups; members join with an invite code and log the
-- group's habits. The coach sees done / not-done + streaks, NEVER photos.
-- Safe to re-run.
-- ============================================================

-- Groups (owned by a coach) ----------------------------------------------------
create table if not exists public.groups (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  invite_code  text not null unique,
  created_at   timestamptz not null default now()
);
alter table public.groups enable row level security;

-- Group habits -----------------------------------------------------------------
create table if not exists public.group_habits (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  name        text not null,
  icon        text not null default 'sparkles',
  color       text not null default 'c-emerald',
  difficulty  text not null default 'medium',
  verify      boolean not null default false,
  sort        int not null default 0,
  created_at  timestamptz not null default now()
);
alter table public.group_habits enable row level security;

-- Group members ----------------------------------------------------------------
create table if not exists public.group_members (
  id            uuid primary key default gen_random_uuid(),
  group_id      uuid not null references public.groups(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  display_name  text not null default 'Miembro',
  joined_at     timestamptz not null default now(),
  unique (group_id, user_id)
);
alter table public.group_members enable row level security;

-- Group completions (per member / habit / day) --------------------------------
create table if not exists public.group_completions (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  habit_id    uuid not null references public.group_habits(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        text not null,               -- YYYY-MM-DD
  count       int not null default 1,
  created_at  timestamptz not null default now(),
  unique (habit_id, user_id, date)
);
alter table public.group_completions enable row level security;

-- Helper predicates ------------------------------------------------------------
-- (inline subqueries in policies below; kept simple for clarity)

-- RLS: groups ------------------------------------------------------------------
drop policy if exists "groups_select" on public.groups;
create policy "groups_select" on public.groups for select using (
  owner_id = auth.uid()
  or id in (select group_id from public.group_members where user_id = auth.uid())
);
drop policy if exists "groups_insert" on public.groups;
create policy "groups_insert" on public.groups for insert with check (owner_id = auth.uid());
drop policy if exists "groups_update" on public.groups;
create policy "groups_update" on public.groups for update using (owner_id = auth.uid());
drop policy if exists "groups_delete" on public.groups;
create policy "groups_delete" on public.groups for delete using (owner_id = auth.uid());

-- RLS: group_habits ------------------------------------------------------------
drop policy if exists "ghabits_select" on public.group_habits;
create policy "ghabits_select" on public.group_habits for select using (
  group_id in (select id from public.groups where owner_id = auth.uid())
  or group_id in (select group_id from public.group_members where user_id = auth.uid())
);
drop policy if exists "ghabits_write" on public.group_habits;
create policy "ghabits_write" on public.group_habits for all
  using (group_id in (select id from public.groups where owner_id = auth.uid()))
  with check (group_id in (select id from public.groups where owner_id = auth.uid()));

-- RLS: group_members -----------------------------------------------------------
drop policy if exists "gmembers_select" on public.group_members;
create policy "gmembers_select" on public.group_members for select using (
  user_id = auth.uid()
  or group_id in (select id from public.groups where owner_id = auth.uid())
);
-- Members may leave; owners may remove members.
drop policy if exists "gmembers_delete" on public.group_members;
create policy "gmembers_delete" on public.group_members for delete using (
  user_id = auth.uid()
  or group_id in (select id from public.groups where owner_id = auth.uid())
);
-- Inserts happen through join_group() (security definer) — no direct insert policy.

-- RLS: group_completions -------------------------------------------------------
drop policy if exists "gcompletions_select" on public.group_completions;
create policy "gcompletions_select" on public.group_completions for select using (
  user_id = auth.uid()
  or group_id in (select id from public.groups where owner_id = auth.uid())
);
drop policy if exists "gcompletions_write" on public.group_completions;
create policy "gcompletions_write" on public.group_completions for all
  using (
    user_id = auth.uid()
    and group_id in (select group_id from public.group_members where user_id = auth.uid())
  )
  with check (
    user_id = auth.uid()
    and group_id in (select group_id from public.group_members where user_id = auth.uid())
  );

create index if not exists gcompletions_group_date_idx on public.group_completions(group_id, date);
create index if not exists gmembers_group_idx on public.group_members(group_id);
create index if not exists ghabits_group_idx on public.group_habits(group_id);

-- RPC: preview a group by its invite code (before joining) ----------------------
create or replace function public.group_by_code(p_code text)
returns table (id uuid, name text, member_count bigint)
language sql security definer set search_path = public as $$
  select g.id, g.name, (select count(*) from public.group_members m where m.group_id = g.id)
  from public.groups g
  where upper(g.invite_code) = upper(trim(p_code))
  limit 1;
$$;
grant execute on function public.group_by_code(text) to authenticated;

-- RPC: join a group by code (idempotent) ---------------------------------------
create or replace function public.join_group(p_code text, p_name text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  g_id uuid;
begin
  select id into g_id from public.groups
  where upper(invite_code) = upper(trim(p_code)) limit 1;
  if g_id is null then
    raise exception 'invalid_code';
  end if;
  insert into public.group_members (group_id, user_id, display_name)
  values (g_id, auth.uid(), coalesce(nullif(trim(p_name), ''), 'Miembro'))
  on conflict (group_id, user_id)
  do update set display_name = excluded.display_name;
  return g_id;
end;
$$;
grant execute on function public.join_group(text, text) to authenticated;
