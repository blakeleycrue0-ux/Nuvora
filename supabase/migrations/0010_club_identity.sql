-- ============================================================
-- Football Clubs 10x — Stage 1: club identity + player profiles.
-- Additive & safe to re-run. Nothing existing is removed.
-- ============================================================

-- Club identity on the group ---------------------------------------------------
alter table public.groups add column if not exists sport text not null default 'football';
alter table public.groups add column if not exists color text not null default '#45c68e'; -- accent hex
alter table public.groups add column if not exists crest text;                            -- emoji / short badge

-- Player profile on the membership --------------------------------------------
alter table public.group_members add column if not exists "position" text; -- e.g. GK, DF, MF, FW
alter table public.group_members add column if not exists number int;      -- shirt number

-- A player can set ONLY their own position + number (never their role).
create or replace function public.set_my_player_profile(p_group uuid, p_position text, p_number int)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.group_members
     set "position" = nullif(trim(p_position), ''),
         number = p_number
   where group_id = p_group and user_id = auth.uid();
end $$;
grant execute on function public.set_my_player_profile(uuid, text, int) to authenticated;

-- (Club identity is edited by managers via the existing groups UPDATE policy,
--  and coaches/admins set player number/position via the existing
--  group_members UPDATE policy — no new policies required.)
