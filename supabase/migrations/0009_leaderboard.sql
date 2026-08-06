-- ============================================================
-- Fenom global leaderboard. Real, server-authoritative ranking by XP.
-- Additive & safe to re-run.
--
-- XP is NOT trusted from the client: it is recomputed in the database from the
-- user's own `completions` (× habit difficulty) by a trigger, and stored in a
-- public `profiles` table. Clients can only SELECT profiles (public leaderboard
-- fields); they can never write XP. Ranking is computed DB-side.
-- ============================================================

-- Level curve — mirrors the app's levelFromXP (need starts at 100, +60/level).
create or replace function public.level_from_xp(p_xp int)
returns int language plpgsql immutable as $$
declare lvl int := 1; need int := 100; acc int := 0;
begin
  if p_xp is null or p_xp < 0 then return 1; end if;
  while p_xp >= acc + need and lvl < 999 loop
    acc := acc + need; lvl := lvl + 1; need := need + 60;
  end loop;
  return lvl;
end $$;

-- Public profile (the only data the leaderboard exposes). No email / no private
-- fields ever live here.
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Fenom Athlete',
  xp           int  not null default 0,
  level        int  not null default 1,
  updated_at   timestamptz not null default now()  -- also the tie-breaker
);
alter table public.profiles enable row level security;

-- Everyone signed in can read the leaderboard; nobody can write it directly.
drop policy if exists "profiles_read" on public.profiles;
create policy "profiles_read" on public.profiles for select to authenticated using (true);
-- (No insert/update/delete policies → all writes go through SECURITY DEFINER fns.)

-- Ranking index: XP desc, then earliest to reach it, then id — deterministic.
create index if not exists profiles_rank_idx on public.profiles (xp desc, updated_at asc, id asc);

-- Recompute a user's authoritative XP from their completions and upsert profile.
-- easy=8, medium=14, hard=22 (matches DIFFICULTY_XP), multiplied by count.
create or replace function public.fenom_recompute_xp(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_xp int; v_name text;
begin
  select coalesce(sum(
      (case h.difficulty when 'easy' then 8 when 'hard' then 22 else 14 end) * c.count
    ), 0)
    into v_xp
    from public.completions c
    join public.habits h on h.id = c.habit_id
    where c.user_id = p_user;

  select coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
                  nullif(trim(u.raw_user_meta_data->>'name'), ''),
                  'Fenom Athlete')
    into v_name
    from auth.users u where u.id = p_user;

  insert into public.profiles (id, display_name, xp, level, updated_at)
  values (p_user, coalesce(v_name, 'Fenom Athlete'), v_xp, public.level_from_xp(v_xp), now())
  on conflict (id) do update
    set xp = excluded.xp,
        level = excluded.level,
        -- bump the tie-breaker only when XP actually changes
        updated_at = case when public.profiles.xp <> excluded.xp then now() else public.profiles.updated_at end;
end $$;

-- Keep XP fresh whenever completions change.
create or replace function public.fenom_completions_xp_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.fenom_recompute_xp(coalesce(NEW.user_id, OLD.user_id));
  return null;
end $$;
drop trigger if exists trg_completions_xp on public.completions;
create trigger trg_completions_xp
  after insert or update or delete on public.completions
  for each row execute function public.fenom_completions_xp_trigger();

-- Ensure the caller has a profile (called on login). Idempotent; refreshes XP
-- and keeps the public display name in sync with the account name.
create or replace function public.fenom_ensure_profile()
returns void language plpgsql security definer set search_path = public as $$
declare v_name text;
begin
  perform public.fenom_recompute_xp(auth.uid());
  select coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
                  nullif(trim(u.raw_user_meta_data->>'name'), ''),
                  'Fenom Athlete')
    into v_name from auth.users u where u.id = auth.uid();
  update public.profiles set display_name = coalesce(v_name, 'Fenom Athlete') where id = auth.uid();
end $$;
grant execute on function public.fenom_ensure_profile() to authenticated;

-- The current user's global rank + totals. Rank via an index-friendly count.
create or replace function public.leaderboard_me()
returns table (rank bigint, display_name text, level int, xp int, total bigint, is_me boolean)
language sql security definer set search_path = public as $$
  with me as (select * from public.profiles where id = auth.uid())
  select
    (select count(*) from public.profiles p, me
       where p.xp > me.xp
          or (p.xp = me.xp and (p.updated_at < me.updated_at
          or (p.updated_at = me.updated_at and p.id < me.id)))) + 1,
    me.display_name, me.level, me.xp,
    (select count(*) from public.profiles),
    true
  from me;
$$;
grant execute on function public.leaderboard_me() to authenticated;

-- A page of the global ranking (rank is the true global position).
create or replace function public.leaderboard_page(p_limit int, p_offset int)
returns table (rank bigint, display_name text, level int, xp int, is_me boolean)
language sql security definer set search_path = public as $$
  select row_number() over (order by xp desc, updated_at asc, id asc),
         display_name, level, xp, (id = auth.uid())
  from public.profiles
  order by xp desc, updated_at asc, id asc
  offset greatest(coalesce(p_offset, 0), 0)
  limit least(coalesce(p_limit, 20), 100);
$$;
grant execute on function public.leaderboard_page(int, int) to authenticated;

-- The users immediately around the caller (±p_range).
create or replace function public.leaderboard_around(p_range int)
returns table (rank bigint, display_name text, level int, xp int, is_me boolean)
language sql security definer set search_path = public as $$
  with ranked as (
    select row_number() over (order by xp desc, updated_at asc, id asc) as rank,
           id, display_name, level, xp
    from public.profiles
  ), me as (select rank from ranked where id = auth.uid())
  select r.rank, r.display_name, r.level, r.xp, (r.id = auth.uid())
  from ranked r, me
  where r.rank between me.rank - greatest(coalesce(p_range, 3), 0)
                  and me.rank + greatest(coalesce(p_range, 3), 0)
  order by r.rank;
$$;
grant execute on function public.leaderboard_around(int) to authenticated;

-- Backfill: give every existing user a profile with their current XP.
do $$ declare u record; begin
  for u in select id from auth.users loop
    perform public.fenom_recompute_xp(u.id);
  end loop;
end $$;
