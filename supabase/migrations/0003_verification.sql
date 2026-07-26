-- AI photo verification.

-- 1) Habits can require a photo check to complete.
alter table public.habits add column if not exists verify boolean not null default false;

-- 2) Verification history.
create table if not exists public.verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid references public.habits(id) on delete set null,
  habit_name text not null,
  date date not null,
  approved boolean not null,
  explanation text not null default '',
  xp_earned int not null default 0,
  image_path text,
  created_at timestamptz not null default now()
);

alter table public.verifications enable row level security;

drop policy if exists "own verifications" on public.verifications;
create policy "own verifications" on public.verifications for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists verifications_user_idx on public.verifications(user_id, created_at desc);

-- 3) Private storage bucket for the photos.
insert into storage.buckets (id, name, public)
values ('verifications', 'verifications', false)
on conflict (id) do nothing;

-- Users can upload/read/delete only files under their own user-id folder.
drop policy if exists "verif upload own" on storage.objects;
drop policy if exists "verif read own" on storage.objects;
drop policy if exists "verif delete own" on storage.objects;

create policy "verif upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'verifications' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "verif read own" on storage.objects for select to authenticated
  using (bucket_id = 'verifications' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "verif delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'verifications' and (storage.foldername(name))[1] = auth.uid()::text);
