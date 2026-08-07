-- ============================================================
-- Football Clubs 10x — Stage 2: training sessions & attendance
--   + club crest image upload (Supabase Storage).
-- Additive & safe to re-run.
-- ============================================================

-- Club crest image URL --------------------------------------------------------
alter table public.groups add column if not exists crest_url text;

-- Storage bucket for crests (public read). ------------------------------------
insert into storage.buckets (id, name, public)
values ('crests', 'crests', true)
on conflict (id) do nothing;

drop policy if exists "crests_read" on storage.objects;
create policy "crests_read" on storage.objects for select using (bucket_id = 'crests');
drop policy if exists "crests_insert" on storage.objects;
create policy "crests_insert" on storage.objects for insert to authenticated with check (bucket_id = 'crests');
drop policy if exists "crests_update" on storage.objects;
create policy "crests_update" on storage.objects for update to authenticated using (bucket_id = 'crests');
drop policy if exists "crests_delete" on storage.objects;
create policy "crests_delete" on storage.objects for delete to authenticated using (bucket_id = 'crests');

-- Sessions (training / match / other) -----------------------------------------
create table if not exists public.group_sessions (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  title      text not null,
  kind       text not null default 'training',  -- training | match | other
  starts_at  timestamptz not null,
  location   text,
  notes      text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.group_sessions enable row level security;
create index if not exists group_sessions_group_idx on public.group_sessions(group_id, starts_at);

drop policy if exists "sessions_select" on public.group_sessions;
create policy "sessions_select" on public.group_sessions for select
  using (public.is_group_owner(group_id) or public.is_group_member(group_id));
drop policy if exists "sessions_write" on public.group_sessions;
create policy "sessions_write" on public.group_sessions for all
  using (public.can_manage_group(group_id))
  with check (public.can_manage_group(group_id) and created_by = auth.uid());

-- Attendance (one row per player per session) ---------------------------------
create table if not exists public.session_attendance (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.group_sessions(id) on delete cascade,
  group_id   uuid not null references public.groups(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  status     text not null default 'going',      -- going | maybe | out
  updated_at timestamptz not null default now(),
  unique (session_id, user_id)
);
alter table public.session_attendance enable row level security;
create index if not exists attendance_session_idx on public.session_attendance(session_id);

-- Everyone in the club can see who's coming; players write only their own RSVP;
-- managers can also adjust anyone's (e.g. mark attended).
drop policy if exists "attendance_select" on public.session_attendance;
create policy "attendance_select" on public.session_attendance for select
  using (public.is_group_owner(group_id) or public.is_group_member(group_id));
drop policy if exists "attendance_write_self" on public.session_attendance;
create policy "attendance_write_self" on public.session_attendance for all
  using (user_id = auth.uid() and public.is_group_member(group_id))
  with check (user_id = auth.uid() and public.is_group_member(group_id));
drop policy if exists "attendance_write_mgr" on public.session_attendance;
create policy "attendance_write_mgr" on public.session_attendance for all
  using (public.can_manage_group(group_id))
  with check (public.can_manage_group(group_id));
