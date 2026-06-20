import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { sql } from '@/lib/db';
import { PLANS, isPlanId } from '@/lib/billing';

export const runtime = 'nodejs';

// Fixed field order Paymob concatenates for the TRANSACTION processed callback HMAC.
// Values are pulled from the callback `obj` (nested keys use dot paths) and joined
// with no separator, then HMAC-SHA512'd with the account's HMAC secret (hex).
const HMAC_FIELDS = [
  'amount_cents', 'created_at', 'currency', 'error_occured', 'has_parent_transaction',
  'id', 'integration_id', 'is_3d_secure', 'is_auth', 'is_capture', 'is_refunded',
  'is_standalone_payment', 'is_voided', 'order.id', 'owner', 'pending',
  'source_data.pan', 'source_data.sub_type', 'source_data.type', 'success',
] as const;

function pick(obj: Record<string, unknown>, path: string): string {
  const v = path.split('.').reduce<unknown>((acc, k) => (acc == null ? acc : (acc as Record<string, unknown>)[k]), obj);
  return v === undefined || v === null ? '' : String(v);
}

function verifyHmac(obj: Record<string, unknown>, received: string | null): boolean {
  const secret = process.env.PAYMOB_HMAC_SECRET;
  if (!secret || !received) return false;
  const concatenated = HMAC_FIELDS.map(f => pick(obj, f)).join('');
  const expected = crypto.createHmac('sha512', secret).update(concatenated).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const obj = body?.obj as Record<string, unknown> | undefined;
    if (!obj) return new Response('ok'); // not a transaction callback — ack and ignore

    // HMAC arrives as a query param on the notification_url (fallback to body.hmac).
    const received = req.nextUrl.searchParams.get('hmac') ?? (body.hmac as string | undefined) ?? null;
    if (!verifyHmac(obj, received)) {
      console.error('[paymob] HMAC mismatch');
      return new Response('ok'); // ack so Paymob stops retrying; do not act
    }

    const order = obj.order as Record<string, unknown> | undefined;
    const extra = (obj.payment_key_claims as Record<string, unknown> | undefined)?.extra as
      | Record<string, unknown>
      | undefined;
    const ref =
      (order?.merchant_order_id as string | undefined) ??
      (extra?.special_reference as string | undefined) ??
      null;
    if (!ref) return new Response('ok');

    const success = obj.success === true || obj.success === 'true';

    if (!success) {
      await sql`
        UPDATE payments SET status = 'failed', paymob_txn_id = ${String(obj.id ?? '')}, updated_at = now()
        WHERE special_reference = ${ref} AND status = 'pending'
      `;
      return new Response('ok');
    }

    // Idempotent claim: only the first successful callback flips the pending row.
    const claimed = await sql`
      UPDATE payments SET status = 'paid', paymob_txn_id = ${String(obj.id ?? '')}, updated_at = now()
      WHERE special_reference = ${ref} AND status = 'pending'
      RETURNING user_id, plan
    `;
    if (!claimed.length) return new Response('ok'); // already processed or unknown ref

    const { user_id, plan } = claimed[0];
    const months = isPlanId(plan) ? PLANS[plan].months : 1;

    // Manual renewal: extend from the later of now / existing end (no auto-renew).
    await sql`
      INSERT INTO subscriptions (user_id, provider, plan, status, current_period_end, external_ref, updated_at)
      VALUES (
        ${user_id}::uuid, 'paymob', ${plan}, 'active',
        now() + make_interval(months => ${months}), ${ref}, now()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        plan               = EXCLUDED.plan,
        status             = 'active',
        current_period_end = GREATEST(COALESCE(subscriptions.current_period_end, now()), now())
                             + make_interval(months => ${months}),
        external_ref       = EXCLUDED.external_ref,
        updated_at         = now()
    `;

    return new Response('ok');
  } catch (err) {
    console.error('[paymob]', err);
    return new Response('error', { status: 500 });
  }
}
