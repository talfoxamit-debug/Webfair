-- Cache of contact names Quo already knows, synced via /api/quo/webhook
-- (contact.updated / contact.deleted). Used to give a real name to a number
-- the CRM discovers through a call or text, instead of just a phone number.
-- Run once in the Supabase SQL editor. RLS on, no public policies.

create table if not exists public.quo_contacts (
  phone_digits    text primary key,   -- 10-digit normalized number
  name            text not null,
  quo_contact_id  text,
  updated_at      timestamptz not null default now()
);

alter table public.quo_contacts enable row level security;
-- (No policies on purpose, only the service-role key may read/write.)
