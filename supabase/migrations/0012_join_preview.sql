-- ============================================================
-- Football Clubs 10x — branded join preview.
-- group_by_code now returns the club's crest + color so the join screen can
-- show the club's real identity before a player joins. Additive & safe.
-- ============================================================

create or replace function public.group_by_code(p_code text)
returns table (id uuid, name text, member_count bigint, crest text, crest_url text, color text)
language sql security definer set search_path = public as $$
  select g.id, g.name,
         (select count(*) from public.group_members m where m.group_id = g.id),
         g.crest, g.crest_url, g.color
  from public.groups g
  where upper(g.invite_code) = upper(trim(p_code))
  limit 1;
$$;
grant execute on function public.group_by_code(text) to authenticated;
