-- Text message log synced from Quo (formerly OpenPhone) via /api/quo/webhook.
-- Run once in the Supabase SQL editor (same project as your leads/team tables).
-- Writes happen server-side with the service-role key. RLS on, no public policies.

create table if not exists public.quo_messages (
  id            text primary key,   -- Quo message id
  direction     text,               -- 'incoming' | 'outgoing'
  status        text,               -- 'received' | 'delivered' | ...
  phone_digits  text not null,      -- other party's number, 10-digit normalized
  phone_pretty  text,               -- other party's number, formatted
  body          text,
  occurred_at   timestamptz not null,
  raw           jsonb,              -- full event payload, for debugging/future fields
  created_at    timestamptz not null default now()
);

create index if not exists quo_messages_phone_idx on public.quo_messages (phone_digits);
create index if not exists quo_messages_occurred_idx on public.quo_messages (occurred_at desc);

alter table public.quo_messages enable row level security;
-- (No policies on purpose, only the service-role key may read/write.)
