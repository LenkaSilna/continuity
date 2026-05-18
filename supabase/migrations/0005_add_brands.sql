-- Promote `brand` from free text to managed entities (mirrors product_types).
-- Two tables (product_brands + supplement_brands) keep cosmetics and supplement
-- brand pools separate — Solgar doesn't make creams, CeraVe doesn't make vitamins.
--
-- Migration plan: create tables → add brand_id columns → backfill from existing
-- brand text → drop old text columns. Idempotent where possible.

-- ─── tables ──────────────────────────────────────────────────────
create table public.product_brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index product_brands_user_idx on public.product_brands(user_id);

create table public.supplement_brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index supplement_brands_user_idx on public.supplement_brands(user_id);

-- ─── FK columns ──────────────────────────────────────────────────
alter table public.products
  add column if not exists brand_id uuid references public.product_brands(id) on delete set null;

alter table public.supplements
  add column if not exists brand_id uuid references public.supplement_brands(id) on delete set null;

-- ─── backfill: existing brand text → brand row + brand_id ────────
insert into public.product_brands (user_id, name)
  select distinct user_id, brand
  from public.products
  where brand is not null and brand <> ''
on conflict (user_id, name) do nothing;

update public.products p
  set brand_id = b.id
  from public.product_brands b
  where b.user_id = p.user_id
    and b.name = p.brand
    and p.brand_id is null;

insert into public.supplement_brands (user_id, name)
  select distinct user_id, brand
  from public.supplements
  where brand is not null and brand <> ''
on conflict (user_id, name) do nothing;

update public.supplements s
  set brand_id = b.id
  from public.supplement_brands b
  where b.user_id = s.user_id
    and b.name = s.brand
    and s.brand_id is null;

-- ─── drop old text columns ───────────────────────────────────────
alter table public.products    drop column if exists brand;
alter table public.supplements drop column if exists brand;

-- ─── RLS ─────────────────────────────────────────────────────────
alter table public.product_brands     enable row level security;
alter table public.supplement_brands  enable row level security;

create policy "own rows" on public.product_brands
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.supplement_brands
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
