import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { sql } from '@/lib/db';
import { PLANS, isPlanId } from '@/lib/billing';
import { withSchemaRetry } from '@/lib/billingSchema';
import { supabaseAdmin, isStorageConfigured, PAYMENT_PROOFS_BUCKET } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

const MAX_FILE_BYTES = 4 * 1024 * 1024; // client compresses first; Vercel body cap is ~4.5 MB
const WALLETS = new Set(['instapay', 'vodafone_cash', 'other']);

/** Error body the paywall can show verbatim as a diagnostic code. */
function fail(code: string, status: number) {
  return Response.json({ error: code }, { status });
}

/**
 * Submits a manual subscription request: the signed-in user picked a plan, paid
 * the owner's wallet directly, and attaches a screenshot as proof. The
 * screenshot goes to the private payment-proofs bucket when the service key is
 * configured, otherwise into the row itself (screenshot_data, `db:`-prefixed
 * path); either way a `pending` subscription_requests row lands for the admin
 * to review in /admin.
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
      pending = await withSchemaRetry(() => sql`
        SELECT 1 FROM subscription_requests WHERE user_id = ${user.id}::uuid AND status = 'pending' LIMIT 1
      `);
    } catch (err) {
      console.error('[subscription-request] db failed:', err);
      return fail(`db_${(err as { code?: string })?.code ?? 'error'}`, 500);
    }
    if (pending.length) return fail('already_pending', 409);

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const filename = `${user.id}/${Date.now()}.${ext}`;

    // Preferred home for the screenshot is the private Storage bucket; without a
    // service key (or if the upload fails) fall back to storing the bytes in the
    // request row so the flow never blocks on deploy config.
    let inBucket = false;
    if (isStorageConfigured()) {
      const admin = supabaseAdmin();
      const doUpload = () =>
        admin.storage.from(PAYMENT_PROOFS_BUCKET).upload(filename, file, { contentType: file.type });

      let { error: uploadError } = await doUpload();
      if (uploadError && /bucket not found/i.test(uploadError.message)) {
        // The migration's bucket insert wasn't applied — create it and retry once.
        // Surface createBucket's own failure (e.g. a non-service key hitting RLS)
        // instead of letting it read as a second "bucket not found".
        const { error: createError } = await admin.storage.createBucket(PAYMENT_PROOFS_BUCKET, {
          public: false,
        });
        if (createError) {
          console.error('[subscription-request] createBucket failed:', createError.message);
        }
        ({ error: uploadError } = await doUpload());
      }
      if (uploadError) console.error('[subscription-request] upload failed, storing in db:', uploadError);
      else inBucket = true;
    }

    const screenshotPath = inBucket ? filename : `db:${filename}`;
    const screenshotData = inBucket ? null : Buffer.from(await file.arrayBuffer());

    let rows;
    try {
      rows = await withSchemaRetry(() => sql`
        INSERT INTO subscription_requests (user_id, plan, amount_cents, wallet, screenshot_path, screenshot_data)
        VALUES (${user.id}::uuid, ${plan}, ${PLANS[plan].amount}, ${wallet}, ${screenshotPath}, ${screenshotData})
        RETURNING id, status, created_at
      `);
    } catch (err) {
      console.error('[subscription-request] insert failed:', err);
      return fail(`db_${(err as { code?: string })?.code ?? 'error'}`, 500);
    }

    return Response.json({ request: rows[0] });
  } catch (err) {
    console.error('[subscription-request]', err);
    return fail('server_error', 500);
  }
}
