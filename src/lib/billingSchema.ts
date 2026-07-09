import { sql } from './db';

/**
 * True when a query failed because a table or column from an unapplied billing
 * migration is missing (42P01 undefined_table / 42703 undefined_column).
 */
export function isSchemaMissing(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  return code === '42P01' || code === '42703';
}

/** Runs `run`, self-healing the billing schema once if it hits a missing table/column. */
export async function withSchemaRetry<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (err) {
    if (!isSchemaMissing(err)) throw err;
    console.warn('[billingSchema] missing table/column — applying billing schema inline');
    await ensureBillingSchema();
    return run();
  }
}

/**
 * Self-heal for a database the billing migrations never reached: mirrors
 * supabase/migrations/20260620073805_subscriptions.sql,
 * 20260708135229_subscription_requests.sql, and
 * 20260709170000_subscription_request_screenshot_data.sql — minus the storage
 * bucket, which the submit route creates via the Storage API when configured.
 * `sql` connects as the postgres owner, so DDL is permitted; everything is
 * idempotent, so a later `supabase db push` still applies cleanly.
 */
export async function ensureBillingSchema() {
  await sql.unsafe(`
    create table if not exists public.subscriptions (
      id                 uuid        primary key default gen_random_uuid(),
      user_id            uuid        not null unique references auth.users (id) on delete cascade,
      provider           text        not null default 'paymob',
      plan               text,
      status             text        not null default 'inactive',
      current_period_end timestamptz,
      auto_renew         boolean     not null default false,
      external_ref       text,
      created_at         timestamptz not null default now(),
      updated_at         timestamptz not null default now()
    );

    create index if not exists subscriptions_user_id on public.subscriptions (user_id);

    create table if not exists public.payments (
      id                uuid        primary key default gen_random_uuid(),
      user_id           uuid        references auth.users (id) on delete set null,
      plan              text,
      amount_cents      int,
      currency          text        not null default 'EGP',
      status            text        not null default 'pending',
      special_reference text        not null unique,
      paymob_txn_id     text,
      created_at        timestamptz not null default now(),
      updated_at        timestamptz not null default now()
    );

    create index if not exists payments_user_id on public.payments (user_id);

    alter table public.subscriptions enable row level security;
    alter table public.payments      enable row level security;

    drop policy if exists "subscriptions_select_own" on public.subscriptions;
    create policy "subscriptions_select_own" on public.subscriptions
      for select using (auth.uid() = user_id);

    create table if not exists public.subscription_requests (
      id              uuid        primary key default gen_random_uuid(),
      user_id         uuid        not null references auth.users (id) on delete cascade,
      plan            text        not null,
      amount_cents    int,
      wallet          text,
      screenshot_path text        not null,
      status          text        not null default 'pending',
      admin_note      text,
      reviewed_at     timestamptz,
      created_at      timestamptz not null default now(),
      updated_at      timestamptz not null default now()
    );

    alter table public.subscription_requests
      add column if not exists screenshot_data bytea;

    create index if not exists subscription_requests_user_id on public.subscription_requests (user_id);
    create index if not exists subscription_requests_status  on public.subscription_requests (status, created_at desc);

    alter table public.subscription_requests enable row level security;

    drop policy if exists "subscription_requests_select_own" on public.subscription_requests;
    create policy "subscription_requests_select_own" on public.subscription_requests
      for select using (auth.uid() = user_id);
  `);
}
