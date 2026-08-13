-- keepalive_log — one row per keep-alive pipeline run.
-- Not user-owned data: the GitHub Actions workflow INSERTs here weekly using
-- the service_role key (which bypasses RLS) so the write itself is
-- unambiguous "activity" that resets Supabase's free-tier inactivity timer.
-- RLS is enabled with no policies — anon/authenticated get zero access,
-- only service_role can read or write.
create table public.keepalive_log (
  id uuid primary key default gen_random_uuid(),
  pinged_at timestamptz not null default now()
);

alter table public.keepalive_log enable row level security;
