import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { sql } from '@/lib/db';
import { PLANS, isPlanId } from '@/lib/billing';
import { supabaseAdmin, PAYMENT_PROOFS_BUCKET } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

const MAX_FILE_BYTES = 4 * 1024 * 1024; // client compresses first; Vercel body cap is ~4.5 MB
const WALLETS = new Set(['instapay', 'vodafone_cash', 'other']);

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

    if (!isPlanId(plan)) return new Response('bad request', { status: 400 });
    const wallet = typeof walletRaw === 'string' && WALLETS.has(walletRaw) ? walletRaw : 'other';
    if (!(file instanceof File) || !file.type.startsWith('image/') || file.size === 0) {
      return new Response('screenshot required', { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) return new Response('file too large', { status: 413 });

    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response('unauthorized', { status: 401 });

    const pending = await sql`
      SELECT 1 FROM subscription_requests WHERE user_id = ${user.id}::uuid AND status = 'pending' LIMIT 1
    `;
    if (pending.length) return Response.json({ error: 'already_pending' }, { status: 409 });

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabaseAdmin()
      .storage.from(PAYMENT_PROOFS_BUCKET)
      .upload(path, file, { contentType: file.type });
    if (uploadError) {
      console.error('[subscription-request] upload failed:', uploadError);
      return new Response('upload failed', { status: 502 });
    }

    const rows = await sql`
      INSERT INTO subscription_requests (user_id, plan, amount_cents, wallet, screenshot_path)
      VALUES (${user.id}::uuid, ${plan}, ${PLANS[plan].amount}, ${wallet}, ${path})
      RETURNING id, status, created_at
    `;

    return Response.json({ request: rows[0] });
  } catch (err) {
    console.error('[subscription-request]', err);
    return new Response('error', { status: 500 });
  }
}
