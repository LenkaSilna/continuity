-- custom_prompts.period_days — how many days of usage data (mood, cycle,
-- observations, log entries) a custom prompt pulls in when generated.
-- Library items (products/supplements/habits) and the intentional routine
-- are never date-scoped, so this only affects the historical/usage blocks.
alter table public.custom_prompts
  add column period_days integer not null default 30;
