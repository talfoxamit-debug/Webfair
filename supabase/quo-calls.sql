-- Call log synced from Quo (formerly OpenPhone) via webhook: /api/quo/webhook.
-- Run once in the Supabase SQL editor (same project as your leads/team tables).
-- Writes happen server-side with the service-role key. RLS on, no public policies.

create table if not exists public.quo_calls (
  id                text primary key,        -- Quo call id
  direction         text,                    -- 'incoming' | 'outgoing'
  status            text,                    -- 'completed' | 'missed' | 'voicemail' | ...
  phone_digits      text not null,           -- other party's number, 10-digit normalized
  phone_pretty      text,                    -- other party's number, formatted
  contact_name      text,                    -- Quo's own contact name, if known
  duration_seconds  integer,
  recording_url     text,
  transcript        text,
  summary           text,
  occurred_at       timestamptz not null,
  raw               jsonb,                   -- full event payload, for debugging/future fields
  created_at        timestamptz not null default now()
);

create index if not exists quo_calls_phone_idx on public.quo_calls (phone_digits);
create index if not exists quo_calls_occurred_idx on public.quo_calls (occurred_at desc);

alter table public.quo_calls enable row level security;
-- (No policies on purpose, only the service-role key may read/write.)
