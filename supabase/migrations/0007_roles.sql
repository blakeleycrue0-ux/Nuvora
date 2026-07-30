-- ============================================================
-- Football-first, Stage 2: role-based permissions (additive & safe).
-- Ownership stays the source of truth; roles add delegated access so
-- permissions are driven by role, not hardcoded to the owner. Adds the
-- missing UPDATE policy on group_members so role changes actually persist.
-- ============================================================

-- Can this user manage club content (tasks, announcements)? Owner or a
-- member whose role is coach/admin. SECURITY DEFINER so it never recurses
-- into other tables' RLS policies.
create or replace function public.can_manage_group(p_group uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists(select 1 from public.groups where id = p_group and owner_id = auth.uid())
      or exists(select 1 from public.group_members
                where group_id = p_group and user_id = auth.uid() and role in ('admin','coach'));
$$;
grant execute on function public.can_manage_group(uuid) to authenticated;

-- Can this user administer the club (members, roles, settings)? Owner or admin.
create or replace function public.can_admin_group(p_group uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists(select 1 from public.groups where id = p_group and owner_id = auth.uid())
      or exists(select 1 from public.group_members
                where group_id = p_group and user_id = auth.uid() and role = 'admin');
$$;
grant execute on function public.can_admin_group(uuid) to authenticated;

-- Tasks: managers (owner / coach / admin) may write.
drop policy if exists "ghabits_write" on public.group_habits;
create policy "ghabits_write" on public.group_habits for all
  using (public.can_manage_group(group_id)) with check (public.can_manage_group(group_id));

-- Announcements: managers may write; author must be the acting user.
drop policy if exists "announce_write" on public.group_announcements;
create policy "announce_write" on public.group_announcements for all
  using (public.can_manage_group(group_id))
  with check (public.can_manage_group(group_id) and author_id = auth.uid());

-- Members: admins/owner may change roles. Without this UPDATE policy the
-- role dropdown silently no-ops under RLS.
drop policy if exists "gmembers_update" on public.group_members;
create policy "gmembers_update" on public.group_members for update
  using (public.can_admin_group(group_id)) with check (public.can_admin_group(group_id));

-- Members: a member may leave; admins/owner may remove others.
drop policy if exists "gmembers_delete" on public.group_members;
create policy "gmembers_delete" on public.group_members for delete using (
  user_id = auth.uid() or public.can_admin_group(group_id)
);

-- Groups: managers may rename/update; only the owner may delete (unchanged).
drop policy if exists "groups_update" on public.groups;
create policy "groups_update" on public.groups for update using (public.can_manage_group(id));
