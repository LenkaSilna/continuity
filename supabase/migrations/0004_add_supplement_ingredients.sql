-- Add a free-text ingredients column to supplements (full list as printed
-- on the label — actives + excipients). Analogous to INCI on products.

alter table public.supplements
  add column if not exists ingredients text;
