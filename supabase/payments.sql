-- Optional: durable log of Stripe payment events (webhook → /api/webhooks/stripe).
-- Run once in the Supabase SQL editor. The webhook works without it; this just
-- keeps a record you can query. RLS on, service-role writes only.

create table if not exists public.payments (
  id          text primary key,   -- Stripe event id (idempotent)
  type        text,
  email       text,
  amount_cents integer,
  status      text,
  created_at  timestamptz not null default now()
);

alter table public.payments enable row level security;
-- (No policies on purpose, only the service-role key may read/write.)
