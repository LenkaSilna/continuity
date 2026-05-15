-- Continuity — initial schema (LEN-101)
-- Run in Supabase Dashboard → SQL Editor.

create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────────────────
-- profile  (1 row per user)
-- ────────────────────────────────────────────────────────────────────────
create table public.profile (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  name text,
  date_of_birth date,
  gender text check (gender in ('female', 'male', 'prefer-not-to-say')),
  skin_types text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────────
-- product_types  (user-managed list of skincare categories)
-- e.g. cleanser, serum, moisturizer, SPF — but user can add/edit/remove
-- ────────────────────────────────────────────────────────────────────────
create table public.product_types (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  position smallint not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index product_types_user_idx on public.product_types(user_id, position);

-- ────────────────────────────────────────────────────────────────────────
-- products  (skincare library)
-- ────────────────────────────────────────────────────────────────────────
create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  brand text,
  type_id uuid references public.product_types(id) on delete set null,
  active_ingredients text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index products_user_idx on public.products(user_id, is_active);

-- ────────────────────────────────────────────────────────────────────────
-- supplements  (vitamins, minerals, etc.)
-- ────────────────────────────────────────────────────────────────────────
create table public.supplements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  brand text,
  dosage text,
  purpose text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index supplements_user_idx on public.supplements(user_id, is_active);

-- ────────────────────────────────────────────────────────────────────────
-- habits  (teeth brushing, flossing, exercise, …)
-- ────────────────────────────────────────────────────────────────────────
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index habits_user_idx on public.habits(user_id, is_active);

-- ────────────────────────────────────────────────────────────────────────
-- routine_items  (template: "this item is done in this slot, in this order")
-- ────────────────────────────────────────────────────────────────────────
create table public.routine_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  time_of_day text not null check (time_of_day in ('morning', 'afternoon', 'evening')),
  item_kind text not null check (item_kind in ('product', 'supplement', 'habit')),
  product_id uuid references public.products(id) on delete cascade,
  supplement_id uuid references public.supplements(id) on delete cascade,
  habit_id uuid references public.habits(id) on delete cascade,
  position smallint not null default 0,
  created_at timestamptz not null default now(),
  constraint routine_item_kind_match check (
    (item_kind = 'product' and product_id is not null and supplement_id is null and habit_id is null) or
    (item_kind = 'supplement' and supplement_id is not null and product_id is null and habit_id is null) or
    (item_kind = 'habit' and habit_id is not null and product_id is null and supplement_id is null)
  )
);

create index routine_items_slot_idx
  on public.routine_items(user_id, time_of_day, item_kind, position);

-- ────────────────────────────────────────────────────────────────────────
-- daily_log  (one row per (date, routine_item) when checked off)
-- ────────────────────────────────────────────────────────────────────────
create table public.daily_log (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  log_date date not null,
  routine_item_id uuid not null references public.routine_items(id) on delete cascade,
  done_at timestamptz not null default now(),
  primary key (user_id, log_date, routine_item_id)
);

create index daily_log_date_idx on public.daily_log(user_id, log_date);

-- ────────────────────────────────────────────────────────────────────────
-- daily_notes  (mood + free-form per day)
-- ────────────────────────────────────────────────────────────────────────
create table public.daily_notes (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  log_date date not null,
  mood smallint check (mood between 1 and 5),
  notes text,
  updated_at timestamptz not null default now(),
  primary key (user_id, log_date)
);

-- ────────────────────────────────────────────────────────────────────────
-- RLS — every table: only own rows
-- ────────────────────────────────────────────────────────────────────────
alter table public.profile         enable row level security;
alter table public.product_types   enable row level security;
alter table public.products        enable row level security;
alter table public.supplements     enable row level security;
alter table public.habits          enable row level security;
alter table public.routine_items   enable row level security;
alter table public.daily_log       enable row level security;
alter table public.daily_notes     enable row level security;

create policy "own rows" on public.profile
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.product_types
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.products
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.supplements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.routine_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.daily_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.daily_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────
-- Auto-update profile.updated_at + daily_notes.updated_at
-- ────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profile_set_updated_at
  before update on public.profile
  for each row execute function public.set_updated_at();

create trigger daily_notes_set_updated_at
  before update on public.daily_notes
  for each row execute function public.set_updated_at();
