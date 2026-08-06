-- ============================================================
-- Fenom mascot + coin economy (personal). Additive & safe to re-run.
--
-- Balance is server-authoritative: it is the SUM of a user's coin_transactions
-- ledger. Earnings are inserted by the client but the DB bounds every earn to
-- the amount declared in reward_definitions (and verifies habit completions
-- actually exist), so the client can never mint arbitrary coins. Spends only
-- happen through the SECURITY DEFINER purchase RPC.
-- ============================================================

-- Reward definitions: the ONLY amounts a positive transaction may carry -------
create table if not exists public.reward_definitions (
  source      text primary key,
  amount      int  not null check (amount >= 0),
  description text not null default ''
);
alter table public.reward_definitions enable row level security;
drop policy if exists "reward_defs_read" on public.reward_definitions;
create policy "reward_defs_read" on public.reward_definitions for select to authenticated using (true);

insert into public.reward_definitions (source, amount, description) values
  ('habit_completed',      5,   'Completar un hábito'),
  ('day_completed',        25,  'Completar todos los hábitos del día'),
  ('streak_milestone',     40,  'Hito de racha'),
  ('achievement_unlocked', 50,  'Logro desbloqueado'),
  ('level_up',             50,  'Subir de nivel'),
  ('welcome_bonus',        100, 'Bienvenida a Fenom')
on conflict (source) do update set amount = excluded.amount, description = excluded.description;

-- Coin ledger -----------------------------------------------------------------
create table if not exists public.coin_transactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  amount     int  not null check (amount <> 0),  -- + earned/granted, - spent
  source     text not null,
  ref        text,                               -- idempotency key
  created_at timestamptz not null default now(),
  unique (user_id, source, ref)
);
alter table public.coin_transactions enable row level security;
create index if not exists coin_txn_user_idx on public.coin_transactions(user_id, created_at desc);

-- Users read their own ledger; may insert ONLY positive (earn) rows for
-- themselves. Negative (spend) rows are inserted exclusively by the purchase
-- RPC (SECURITY DEFINER, which bypasses RLS). No updates/deletes.
drop policy if exists "coin_txn_select" on public.coin_transactions;
create policy "coin_txn_select" on public.coin_transactions for select
  using (user_id = auth.uid());
drop policy if exists "coin_txn_insert" on public.coin_transactions;
create policy "coin_txn_insert" on public.coin_transactions for insert
  with check (user_id = auth.uid() and amount > 0);

-- Trigger: bound every positive txn to its reward definition, and verify that
-- habit_completed refs point at a real completion owned by the user.
create or replace function public.validate_coin_txn()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_def int;
begin
  if NEW.amount > 0 then
    select amount into v_def from public.reward_definitions where source = NEW.source;
    if v_def is null then raise exception 'unknown_source'; end if;
    if NEW.amount <> v_def then raise exception 'amount_mismatch'; end if;

    if NEW.source = 'habit_completed' then
      -- ref = '<habit_id>:<YYYY-MM-DD>'
      if not exists (
        select 1 from public.completions c
        where c.user_id = NEW.user_id
          and c.habit_id::text = split_part(NEW.ref, ':', 1)
          and c.date = split_part(NEW.ref, ':', 2)
      ) then
        raise exception 'no_such_completion';
      end if;
    end if;
  end if;
  return NEW;
end;
$$;
drop trigger if exists trg_validate_coin_txn on public.coin_transactions;
create trigger trg_validate_coin_txn before insert on public.coin_transactions
  for each row execute function public.validate_coin_txn();

-- Item catalog (single source of truth for price / unlock level) --------------
create table if not exists public.mascot_items (
  id             text primary key,
  name           text not null,
  description    text not null default '',
  category       text not null,   -- outfits | accessories | headwear | shoes | special | seasonal
  slot           text not null,   -- clothing | accessory | headwear | shoes
  price          int  not null default 0,
  required_level int  not null default 1,
  rarity         text not null default 'common',
  asset_key      text not null,   -- resolved to real artwork later
  seasonal       boolean not null default false,
  limited        boolean not null default false,
  free           boolean not null default false,
  active         boolean not null default true,
  release_date   text,
  sort           int not null default 0
);
alter table public.mascot_items enable row level security;
drop policy if exists "mascot_items_read" on public.mascot_items;
create policy "mascot_items_read" on public.mascot_items for select to authenticated using (true);

-- Placeholder catalog. Real artwork (asset_key) is supplied later; names,
-- prices and levels can be edited here without a deploy.
insert into public.mascot_items (id, name, description, category, slot, price, required_level, rarity, asset_key, seasonal, limited, free, sort) values
  ('tshirt_basic',    'Camiseta básica',   'Un clásico para empezar.',        'outfits',     'clothing', 0,    1,  'common',    'clothing/tshirt_basic',    false, false, true,  1),
  ('kit_football',    'Equipación',        'Lista para el partido.',          'outfits',     'clothing', 300,  3,  'rare',      'clothing/kit_football',    false, false, false, 2),
  ('hoodie',          'Sudadera',          'Comodidad para entrenar.',        'outfits',     'clothing', 500,  5,  'rare',      'clothing/hoodie',          false, false, false, 3),
  ('jacket',          'Chaqueta',          'Estilo fuera del campo.',         'outfits',     'clothing', 900,  10, 'epic',      'clothing/jacket',          false, false, false, 4),
  ('cap',             'Gorra',             'Para los días de sol.',           'headwear',    'headwear', 150,  2,  'common',    'headwear/cap',             false, false, false, 5),
  ('beanie',          'Gorro',             'Para el frío.',                   'headwear',    'headwear', 200,  4,  'common',    'headwear/beanie',          false, false, false, 6),
  ('crown',           'Corona',            'Solo para leyendas.',             'headwear',    'headwear', 2500, 20, 'legendary', 'headwear/crown',           false, false, false, 7),
  ('sunglasses',      'Gafas de sol',      'Modo estrella.',                  'accessories', 'accessory',400,  5,  'rare',      'accessory/sunglasses',     false, false, false, 8),
  ('backpack',        'Mochila',           'Siempre preparado.',              'accessories', 'accessory',600,  8,  'rare',      'accessory/backpack',       false, false, false, 9),
  ('medal',           'Medalla',           'Por el esfuerzo.',                'accessories', 'accessory',1200, 15, 'epic',      'accessory/medal',          false, false, false, 10),
  ('sneakers',        'Zapatillas',        'Para moverte mejor.',             'shoes',       'shoes',    250,  3,  'common',    'shoes/sneakers',           false, false, false, 11),
  ('boots',           'Botas',             'Agarre total.',                   'shoes',       'shoes',    550,  7,  'rare',      'shoes/boots',              false, false, false, 12),
  ('captain_armband', 'Brazalete',         'Lidera a los tuyos.',             'special',     'accessory',1000, 12, 'epic',      'special/captain_armband',  false, true,  false, 13),
  ('santa_hat',       'Gorro navideño',    'Edición de temporada.',           'seasonal',    'headwear', 800,  1,  'epic',      'seasonal/santa_hat',       true,  true,  false, 14)
on conflict (id) do update set
  name = excluded.name, description = excluded.description, category = excluded.category,
  slot = excluded.slot, price = excluded.price, required_level = excluded.required_level,
  rarity = excluded.rarity, asset_key = excluded.asset_key, seasonal = excluded.seasonal,
  limited = excluded.limited, free = excluded.free, sort = excluded.sort;

-- Inventory (owned items) -----------------------------------------------------
create table if not exists public.mascot_inventory (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_id     text not null references public.mascot_items(id) on delete cascade,
  acquired_at timestamptz not null default now(),
  unique (user_id, item_id)
);
alter table public.mascot_inventory enable row level security;
drop policy if exists "inventory_select" on public.mascot_inventory;
create policy "inventory_select" on public.mascot_inventory for select using (user_id = auth.uid());
-- Inserts happen only through fenom_purchase / fenom_claim_free (definer).

-- Mascot (one per user) -------------------------------------------------------
create table if not exists public.mascots (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users(id) on delete cascade,
  name       text not null default 'Fen',
  equipped   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.mascots enable row level security;
drop policy if exists "mascots_all" on public.mascots;
create policy "mascots_all" on public.mascots for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Level rewards (configurable: bonus coins / free unlock at a level) -----------
create table if not exists public.level_rewards (
  level       int primary key,
  coins       int not null default 0,
  item_id     text references public.mascot_items(id) on delete set null,
  description text not null default ''
);
alter table public.level_rewards enable row level security;
drop policy if exists "level_rewards_read" on public.level_rewards;
create policy "level_rewards_read" on public.level_rewards for select to authenticated using (true);

insert into public.level_rewards (level, coins, item_id, description) values
  (3,  50,  null, 'Se abre la equipación y las zapatillas'),
  (5,  75,  null, 'Se abren sudadera y gafas de sol'),
  (10, 150, null, 'Se abre la chaqueta'),
  (15, 250, null, 'Se abre la medalla'),
  (20, 500, null, 'Se abre la corona')
on conflict (level) do update set coins = excluded.coins, description = excluded.description;

-- RPC: create the user's mascot + one-time welcome bonus (idempotent) ----------
create or replace function public.fenom_ensure_mascot(p_name text default 'Fen')
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.mascots (user_id, name)
  values (auth.uid(), coalesce(nullif(trim(p_name), ''), 'Fen'))
  on conflict (user_id) do nothing;

  insert into public.coin_transactions (user_id, amount, source, ref)
  values (auth.uid(),
          (select amount from public.reward_definitions where source = 'welcome_bonus'),
          'welcome_bonus', 'initial')
  on conflict (user_id, source, ref) do nothing;
end;
$$;
grant execute on function public.fenom_ensure_mascot(text) to authenticated;

-- RPC: purchase an item. Validates existence, ownership and balance server-side
-- then records the spend + inventory row atomically.
create or replace function public.fenom_purchase(p_item text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_price int; v_active boolean; v_balance int;
begin
  select price, active into v_price, v_active from public.mascot_items where id = p_item;
  if v_price is null or not v_active then raise exception 'item_unavailable'; end if;

  if exists (select 1 from public.mascot_inventory where user_id = auth.uid() and item_id = p_item) then
    raise exception 'already_owned';
  end if;

  v_balance := coalesce((select sum(amount) from public.coin_transactions where user_id = auth.uid()), 0);
  if v_balance < v_price then raise exception 'insufficient_coins'; end if;

  insert into public.mascot_inventory (user_id, item_id) values (auth.uid(), p_item);
  if v_price > 0 then
    insert into public.coin_transactions (user_id, amount, source, ref)
    values (auth.uid(), -v_price, 'shop_purchase', p_item);
  end if;

  return jsonb_build_object('balance', v_balance - v_price, 'item', p_item);
end;
$$;
grant execute on function public.fenom_purchase(text) to authenticated;

-- RPC: claim a free item (no coins). ------------------------------------------
create or replace function public.fenom_claim_free(p_item text)
returns void language plpgsql security definer set search_path = public as $$
declare v_free boolean; v_active boolean;
begin
  select free, active into v_free, v_active from public.mascot_items where id = p_item;
  if v_free is null or not v_active or not v_free then raise exception 'item_unavailable'; end if;
  insert into public.mascot_inventory (user_id, item_id)
  values (auth.uid(), p_item)
  on conflict (user_id, item_id) do nothing;
end;
$$;
grant execute on function public.fenom_claim_free(text) to authenticated;
