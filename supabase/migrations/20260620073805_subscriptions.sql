-- Subscriptions + payments for the Paymob billing layer.
--
-- subscriptions: one row per user holding their current entitlement. Read by the
--   client (browser supabase, RLS select-own); written only by the server webhook
--   via the postgres owner connection (bypasses RLS), like the analytics tables.
-- payments: server-only ledger of each checkout intention, for audit + webhook
--   idempotency (keyed by special_reference).

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                 uuid        primary key default gen_random_uuid(),
  user_id            uuid        not null unique references auth.users (id) on delete cascade,
  provider           text        not null default 'paymob',
  plan               text,                       -- monthly | yearly
  status             text        not null default 'inactive', -- active | expired | inactive
  current_period_end timestamptz,
  auto_renew         boolean     not null default false,
  external_ref       text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists subscriptions_user_id on public.subscriptions (user_id);

-- ---------------------------------------------------------------------------
-- payments (server-only ledger)
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        references auth.users (id) on delete set null,
  plan              text,
  amount_cents      int,
  currency          text        not null default 'EGP',
  status            text        not null default 'pending', -- pending | paid | failed
  special_reference text        not null unique,
  paymob_txn_id     text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists payments_user_id on public.payments (user_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.subscriptions enable row level security;
alter table public.payments      enable row level security;

-- Users may read only their own subscription. Writes go through the owner
-- connection (no client write policy). payments has no client-facing policy.
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);
