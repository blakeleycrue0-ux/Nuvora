-- ============================================================
-- Habit types: timer (focus duration), quantity (goal/amount),
-- counter (uses existing target_per_day). Additive & safe to re-run.
-- Plain "check" habits keep working unchanged.
-- ============================================================

alter table public.habits add column if not exists kind text not null default 'check';
alter table public.habits add column if not exists target_minutes int;   -- timer: daily focus target
alter table public.habits add column if not exists goal_target numeric;   -- quantity: total goal (e.g. 5000)
alter table public.habits add column if not exists goal_unit text;        -- quantity: unit label (e.g. 'km')
