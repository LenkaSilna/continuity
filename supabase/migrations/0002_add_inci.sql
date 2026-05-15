-- Add INCI (full ingredient list as printed on the product label)
-- to skincare products. Different from active_ingredients which only
-- stores the key actives (e.g. "10% niacinamide").

alter table public.products
  add column if not exists inci text;
