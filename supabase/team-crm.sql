-- Shared team CRM store for /prospects (multi-user).
-- Run once in the Supabase SQL editor (same project as your leads table).
-- The whole prospect list is kept as one JSON document; the app reads/writes it
-- server-side with the service-role key, gated by team login. RLS on, no public
-- policies — anon/browser clients can't touch it.

create table if not exists public.team_crm (
  id          text primary key,
  data        jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.team_crm enable row level security;
-- (No policies on purpose — only the service-role key may read/write.)
