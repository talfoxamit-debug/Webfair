-- E-signature records for client agreements (/agreement → /api/sign).
-- Run once in the Supabase SQL editor (same project as your leads/team tables).
-- Writes happen server-side with the service-role key. RLS on, no public policies.

create table if not exists public.signatures (
  id          text primary key,
  business    text,
  signer      text,
  data        jsonb,
  signed_at   timestamptz not null default now(),
  user_agent  text
);

alter table public.signatures enable row level security;
-- (No policies on purpose, only the service-role key may read/write.)
