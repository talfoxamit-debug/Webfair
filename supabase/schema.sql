-- Stackwrk database schema.
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query → paste → Run).
-- The app talks to these tables with the SERVICE-ROLE key from server-side API
-- routes only, so RLS is enabled with NO public policies: anon/browser clients
-- can't read or write, and the service role bypasses RLS. That keeps every lead
-- private while the API keeps working.

-- ---------------------------------------------------------------- leads
create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  name         text not null,
  email        text not null,
  website      text,
  message      text,
  source       text,                       -- 'audit_form' | 'instant_audit' | ...
  utm_source   text,                       -- channel attribution, captured client-side
  utm_medium   text,
  utm_campaign text,
  referrer     text,                       -- first external referrer
  landing_path text,                       -- first page the visitor landed on
  promo_code       text,                   -- referral code captured from ?promo=/?code= (e.g. 'FOX5')
  promo_extra_pct  int,                    -- extra discount % that code carries, looked up server-side
  status       text not null default 'new',-- new|contacted|call_booked|proposal|won|lost
  notes        text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx     on public.leads (status);

alter table public.leads enable row level security;
-- (No policies on purpose, only the service-role key may touch this table.)

-- If the leads table already exists from an earlier version, run this once so
-- channel attribution can be stored (otherwise the API silently drops it):
--   alter table public.leads add column if not exists utm_source   text;
--   alter table public.leads add column if not exists utm_medium   text;
--   alter table public.leads add column if not exists utm_campaign text;
--   alter table public.leads add column if not exists referrer     text;
--   alter table public.leads add column if not exists landing_path text;

-- Referral/promo code support (FOX5 and any future codes), run this once if
-- the leads table predates it:
--   alter table public.leads add column if not exists promo_code      text;
--   alter table public.leads add column if not exists promo_extra_pct int;

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
