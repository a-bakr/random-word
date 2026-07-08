import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import { PLANS, isPlanId } from '@/lib/billing';

export const runtime = 'nodejs';

/**
 * Approves or rejects a pending manual subscription request. Approval upserts the
 * user's subscriptions row exactly like the Paymob webhook does: status active,
 * period extended from the later of now / existing end.
 */
export async function POST(req: NextRequest) {
  try {
    const { requestId, action, note } = await req.json();
    if (typeof requestId !== 'string' || (action !== 'approve' && action !== 'reject')) {
      return new Response('bad request', { status: 400 });
    }

    // Idempotent claim: only a still-pending request can be reviewed.
    const claimed = await sql`
      UPDATE subscription_requests
      SET status = ${action === 'approve' ? 'approved' : 'rejected'},
          admin_note = ${typeof note === 'string' && note ? note : null},
          reviewed_at = now(),
          updated_at = now()
      WHERE id = ${requestId}::uuid AND status = 'pending'
      RETURNING user_id, plan
    `;
    if (!claimed.length) return Response.json({ error: 'not_pending' }, { status: 409 });

    if (action === 'approve') {
      const { user_id, plan } = claimed[0];
      const months = isPlanId(plan) ? PLANS[plan].months : 1;
      await sql`
        INSERT INTO subscriptions (user_id, provider, plan, status, current_period_end, external_ref, updated_at)
        VALUES (
          ${user_id}::uuid, 'manual', ${plan}, 'active',
          now() + make_interval(months => ${months}), ${'manual:' + requestId}, now()
        )
        ON CONFLICT (user_id) DO UPDATE SET
          provider           = 'manual',
          plan               = EXCLUDED.plan,
          status             = 'active',
          current_period_end = GREATEST(COALESCE(subscriptions.current_period_end, now()), now())
                               + make_interval(months => ${months}),
          external_ref       = EXCLUDED.external_ref,
          updated_at         = now()
      `;
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('[admin/subscriptions/review]', err);
    return Response.json({ error: 'query_failed' }, { status: 500 });
  }
}
