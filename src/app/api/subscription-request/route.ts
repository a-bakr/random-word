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

    let pending;
    try {
      pending = await sql`
        SELECT 1 FROM subscription_requests WHERE user_id = ${user.id}::uuid AND status = 'pending' LIMIT 1
      `;
    } catch (err) {
      console.error('[subscription-request] db failed:', err);
      // 42P01 = relation does not exist — the subscription_requests migration
      // hasn't been applied to this database yet (`supabase db push`).
      return fail((err as { code?: string })?.code === '42P01' ? 'db_not_migrated' : 'db_error', 500);
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
