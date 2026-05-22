-- Continuity — full schema.
-- Run this in Supabase Dashboard → SQL Editor for a fresh install.
-- Single, idempotent setup covering: profile, library (products/supplements/
-- habits/observations), routine, calendar (mood, period, logs, notes), settings,
-- per-module on/off flags, and AI prompts. All tables have RLS — only own rows.

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

  -- family + lifestyle (AI prompt context)
  has_partner boolean not null default false,
  children_count integer not null default 0 check (children_count >= 0),
  lifestyle text not null default 'sedentary'
    check (lifestyle in ('sedentary', 'light', 'active', 'very_active')),

  -- appearance
  theme text not null default 'light' check (theme in ('light', 'dark')),
  accent text not null default 'lavender'
    check (accent in ('rose', 'lavender', 'mint')),
  calendar_view text not null default 'month'
    check (calendar_view in ('month', 'week', 'day')),

  -- per-module on/off flags
  module_products boolean not null default true,
  module_supplements boolean not null default true,
  module_habits boolean not null default true,
  module_routine boolean not null default true,
  module_observations boolean not null default true,
  module_cycle boolean not null default true,
  module_journal boolean not null default true,
  module_ai boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────────
-- product taxonomy
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

create table public.product_brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index product_brands_user_idx on public.product_brands(user_id);

-- ────────────────────────────────────────────────────────────────────────
-- products  (skincare library)
-- ────────────────────────────────────────────────────────────────────────
create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  brand_id uuid references public.product_brands(id) on delete set null,
  type_id uuid references public.product_types(id) on delete set null,
  active_ingredients text,
  inci text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index products_user_idx on public.products(user_id, is_active);

-- ────────────────────────────────────────────────────────────────────────
-- supplement taxonomy
-- ────────────────────────────────────────────────────────────────────────
create table public.supplement_types (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  position smallint not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index supplement_types_user_idx on public.supplement_types(user_id, position);

create table public.supplement_brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index supplement_brands_user_idx on public.supplement_brands(user_id);

-- ────────────────────────────────────────────────────────────────────────
-- supplements  (vitamins, minerals, etc.)
-- ────────────────────────────────────────────────────────────────────────
create table public.supplements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  brand_id uuid references public.supplement_brands(id) on delete set null,
  type_id uuid references public.supplement_types(id) on delete set null,
  dosage text,
  purpose text,
  ingredients text,
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
-- archived_at = soft delete so historical daily_log entries keep meaning.
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
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  constraint routine_item_kind_match check (
    (item_kind = 'product' and product_id is not null and supplement_id is null and habit_id is null) or
    (item_kind = 'supplement' and supplement_id is not null and product_id is null and habit_id is null) or
    (item_kind = 'habit' and habit_id is not null and product_id is null and supplement_id is null)
  )
);

create index routine_items_active_idx
  on public.routine_items(user_id, time_of_day, position)
  where archived_at is null;

-- ────────────────────────────────────────────────────────────────────────
-- daily_log  (one row per usage — date + slot + product/supplement/habit)
-- Decoupled from routine_items: deleting/archiving the template does not
-- destroy history.
-- ────────────────────────────────────────────────────────────────────────
create table public.daily_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  log_date date not null,
  time_of_day text not null check (time_of_day in ('morning', 'afternoon', 'evening')),
  item_kind text not null check (item_kind in ('product', 'supplement', 'habit')),
  product_id uuid references public.products(id) on delete cascade,
  supplement_id uuid references public.supplements(id) on delete cascade,
  habit_id uuid references public.habits(id) on delete cascade,
  done_at timestamptz not null default now(),
  constraint daily_log_kind_match check (
    (item_kind = 'product'    and product_id    is not null and supplement_id is null and habit_id is null) or
    (item_kind = 'supplement' and supplement_id is not null and product_id    is null and habit_id is null) or
    (item_kind = 'habit'      and habit_id      is not null and product_id    is null and supplement_id is null)
  )
);

create index daily_log_date_idx on public.daily_log(user_id, log_date);
create unique index daily_log_product_uniq
  on public.daily_log(user_id, log_date, time_of_day, product_id)
  where item_kind = 'product';
create unique index daily_log_supplement_uniq
  on public.daily_log(user_id, log_date, time_of_day, supplement_id)
  where item_kind = 'supplement';
create unique index daily_log_habit_uniq
  on public.daily_log(user_id, log_date, time_of_day, habit_id)
  where item_kind = 'habit';

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
-- cycle_log  (menstruation intensity per day)
-- ────────────────────────────────────────────────────────────────────────
create table public.cycle_log (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  log_date date not null,
  intensity text not null check (intensity in ('light', 'medium', 'heavy')),
  primary key (user_id, log_date)
);

create index cycle_log_date_idx on public.cycle_log(user_id, log_date);

-- ────────────────────────────────────────────────────────────────────────
-- tags  ("Pozorování" library — acne, bad sleep, alcohol, stress…)
-- ────────────────────────────────────────────────────────────────────────
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  category text,
  color text,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index tags_user_idx on public.tags(user_id);

create table public.daily_tags (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  log_date date not null,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (user_id, log_date, tag_id)
);

create index daily_tags_date_idx on public.daily_tags(user_id, log_date);

-- ────────────────────────────────────────────────────────────────────────
-- AI prompts
-- ────────────────────────────────────────────────────────────────────────

-- Saved edits of predefined prompts (skincare / supplements / correlation / weekly).
-- When a row exists, the saved_text is shown instead of the auto-generated version.
create table public.prompt_overrides (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users on delete cascade,
  prompt_type  text        not null,
  saved_text   text        not null,
  updated_at   timestamptz not null default now(),
  unique (user_id, prompt_type)
);

-- Custom user-defined prompts with arbitrary data blocks.
create table public.custom_prompts (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users on delete cascade,
  name         text        not null,
  question     text        not null default '',
  data_blocks  text[]      not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────────
-- RLS — every table: only own rows
-- ────────────────────────────────────────────────────────────────────────
alter table public.profile            enable row level security;
alter table public.product_types      enable row level security;
alter table public.product_brands     enable row level security;
alter table public.products           enable row level security;
alter table public.supplement_types   enable row level security;
alter table public.supplement_brands  enable row level security;
alter table public.supplements        enable row level security;
alter table public.habits             enable row level security;
alter table public.routine_items      enable row level security;
alter table public.daily_log          enable row level security;
alter table public.daily_notes        enable row level security;
alter table public.cycle_log          enable row level security;
alter table public.tags               enable row level security;
alter table public.daily_tags         enable row level security;
alter table public.prompt_overrides   enable row level security;
alter table public.custom_prompts     enable row level security;

create policy "own rows" on public.profile
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.product_types
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.product_brands
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.products
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.supplement_types
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.supplement_brands
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
create policy "own rows" on public.cycle_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.tags
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.daily_tags
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.prompt_overrides
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.custom_prompts
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

create trigger prompt_overrides_set_updated_at
  before update on public.prompt_overrides
  for each row execute function public.set_updated_at();

create trigger custom_prompts_set_updated_at
  before update on public.custom_prompts
  for each row execute function public.set_updated_at();
