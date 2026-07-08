-- Manual subscription requests (InstaPay / Vodafone Cash / other wallets).
--
-- The user pays the owner's wallet number directly, uploads a screenshot of the
-- transfer, and a row lands here as `pending`. The admin reviews it in /admin and
-- approves (which upserts the user's `subscriptions` row) or rejects it.
--
-- subscription_requests: readable by the owning user (RLS select-own) so the app
--   can show "under review"; all writes go through server routes via the postgres
--   owner connection (bypasses RLS), like the analytics tables.
-- payment-proofs: private Storage bucket holding the screenshots. No client
--   storage policies — objects are uploaded and signed server-side only.

create table if not exists public.subscription_requests (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users (id) on delete cascade,
  plan            text        not null,                    -- monthly | yearly
  amount_cents    int,
  wallet          text,                                    -- instapay | vodafone_cash | other
  screenshot_path text        not null,                    -- object path in the payment-proofs bucket
  status          text        not null default 'pending',  -- pending | approved | rejected
  admin_note      text,
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists subscription_requests_user_id on public.subscription_requests (user_id);
create index if not exists subscription_requests_status  on public.subscription_requests (status, created_at desc);

alter table public.subscription_requests enable row level security;

drop policy if exists "subscription_requests_select_own" on public.subscription_requests;
create policy "subscription_requests_select_own" on public.subscription_requests
  for select using (auth.uid() = user_id);

-- Private bucket for payment screenshots (service-key access only).
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;
