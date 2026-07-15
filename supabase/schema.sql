-- Stackwrk database schema.
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query → paste → Run).
-- The app talks to these tables with the SERVICE-ROLE key from server-side API
-- routes only, so RLS is enabled with NO public policies: anon/browser clients
-- can't read or write, and the service role bypasses RLS. That keeps every lead
-- private while the API keeps working.

-- ---------------------------------------------------------------- leads
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  website     text,
  message     text,
  source      text,                       -- 'audit_form' | 'instant_audit' | ...
  status      text not null default 'new',-- new|contacted|call_booked|proposal|won|lost
  notes       text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx     on public.leads (status);

alter table public.leads enable row level security;
-- (No policies on purpose, only the service-role key may touch this table.)

-- ---------------------------------------------------------------- audits
-- Every audit run is logged here (a warm-lead signal: who's checking their score).
create table if not exists public.audits (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  url         text not null,
  score       int,
  load_ms     int,
  page_kb     int
);

create index if not exists audits_created_at_idx on public.audits (created_at desc);

alter table public.audits enable row level security;
-- (No policies, service-role only.)
