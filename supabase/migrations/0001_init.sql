-- Nuvora — initial schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- One row per user, mirrors auth.users.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,

  -- Subscription
  is_pro boolean not null default false,

  -- Onboarding
  onboarding_completed boolean not null default false,
  goal text, -- 'lose_fat' | 'build_muscle' | 'maintain' | 'general_health'
  sex text, -- 'male' | 'female' | 'other'
  birth_year int,
  height_cm numeric,
  current_weight_kg numeric,
  target_weight_kg numeric,
  activity_level text, -- 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  workout_days_per_week int,
  dietary_preference text, -- 'none' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | ...
  equipment text, -- 'full_gym' | 'home_basic' | 'bodyweight_only'

  -- AI-generated plan (from onboarding), free-form JSON so the shape can evolve
  plan jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Keep updated_at fresh.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up (Google or email).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
