-- Add user-managed categories for supplements (vitamins, minerals, herbs, …)
-- Mirrors product_types. type_id on supplements is optional.

create table public.supplement_types (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  position smallint not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index supplement_types_user_idx on public.supplement_types(user_id, position);

alter table public.supplements
  add column if not exists type_id uuid references public.supplement_types(id) on delete set null;

alter table public.supplement_types enable row level security;

create policy "own rows" on public.supplement_types
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
