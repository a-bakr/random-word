import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { sql } from '@/lib/db';
import { PLANS, isPlanId } from '@/lib/billing';
import { supabaseAdmin, PAYMENT_PROOFS_BUCKET } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

const MAX_FILE_BYTES = 4 * 1024 * 1024; // client compresses first; Vercel body cap is ~4.5 MB
const WALLETS = new Set(['instapay', 'vodafone_cash', 'other']);

/** Error body the paywall can show verbatim as a diagnostic code. */
function fail(code: string, status: number) {
  return Response.json({ error: code }, { status });
}

/**
 * Self-heal for a database the subscription_requests migration never reached:
 * mirrors supabase/migrations/20260708135229_subscription_requests.sql (minus
 * the storage bucket, which the upload step below creates via the Storage API).
 * `sql` connects as the postgres owner, so DDL is permitted; everything is
 * idempotent, so a later `supabase db push` still applies cleanly.
 */
async function createSubscriptionRequestsTable() {
  await sql.unsafe(`
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

    create index if not exists subscription_requests_user_id on public.subscription_requests (user_id);
    create index if not exists subscription_requests_status  on public.subscription_requests (status, created_at desc);

    alter table public.subscription_requests enable row level security;

    drop policy if exists "subscription_requests_select_own" on public.subscription_requests;
    create policy "subscription_requests_select_own" on public.subscription_requests
      for select using (auth.uid() = user_id);
  `);
}

/**
 * Submits a manual subscription request: the signed-in user picked a plan, paid
 * the owner's wallet directly, and attaches a screenshot as proof. Stores the
 * screenshot in the private payment-proofs bucket and inserts a `pending`
 * subscription_requests row for the admin to review in /admin.
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const plan = form.get('plan');
    const walletRaw = form.get('wallet');
    const file = form.get('file');

    if (!isPlanId(plan)) return fail('bad_request', 400);
    const wallet = typeof walletRaw === 'string' && WALLETS.has(walletRaw) ? walletRaw : 'other';
    if (!(file instanceof File) || !file.type.startsWith('image/') || file.size === 0) {
      return fail('screenshot_required', 400);
    }
    if (file.size > MAX_FILE_BYTES) return fail('file_too_large', 413);

    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail('unauthorized', 401);

    const pendingQuery = () => sql`
      SELECT 1 FROM subscription_requests WHERE user_id = ${user.id}::uuid AND status = 'pending' LIMIT 1
    `;
    let pending;
    try {
      pending = await pendingQuery();
    } catch (err) {
      // 42P01 = relation does not exist — the subscription_requests migration
      // hasn't been applied to this database yet. Create the table and retry.
      if ((err as { code?: string })?.code !== '42P01') {
        console.error('[subscription-request] db failed:', err);
        return fail('db_error', 500);
      }
      try {
        await createSubscriptionRequestsTable();
        pending = await pendingQuery();
      } catch (err2) {
        console.error('[subscription-request] table self-heal failed:', err2);
        // Distinct from db_not_migrated so the on-screen code shows the DDL
        // failed (with the Postgres error code) rather than never running.
        return fail(`db_selfheal_${(err2 as { code?: string })?.code ?? 'failed'}`, 500);
      }
    }
    if (pending.length) return fail('already_pending', 409);

    let admin;
    try {
      admin = supabaseAdmin();
    } catch (err) {
      console.error('[subscription-request] admin client:', err);
      return fail('storage_not_configured', 500); // SUPABASE_SECRET_KEY / URL missing in this deploy
    }

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${user.id}/${Date.now()}.${ext}`;
    const doUpload = () =>
      admin.storage.from(PAYMENT_PROOFS_BUCKET).upload(path, file, { contentType: file.type });

    let { error: uploadError } = await doUpload();
    if (uploadError && /bucket not found/i.test(uploadError.message)) {
      // The migration's bucket insert wasn't applied — create it and retry once.
      await admin.storage.createBucket(PAYMENT_PROOFS_BUCKET, { public: false });
      ({ error: uploadError } = await doUpload());
    }
    if (uploadError) {
      console.error('[subscription-request] upload failed:', uploadError);
      return fail('upload_failed', 502);
    }

    const rows = await sql`
      INSERT INTO subscription_requests (user_id, plan, amount_cents, wallet, screenshot_path)
      VALUES (${user.id}::uuid, ${plan}, ${PLANS[plan].amount}, ${wallet}, ${path})
      RETURNING id, status, created_at
    `;

    return Response.json({ request: rows[0] });
  } catch (err) {
    console.error('[subscription-request]', err);
    return fail('server_error', 500);
  }
}
