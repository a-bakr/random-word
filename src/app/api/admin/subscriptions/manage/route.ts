import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import { PLANS, isPlanId } from '@/lib/billing';
import { withSchemaRetry } from '@/lib/billingSchema';

export const runtime = 'nodejs';

/**
 * Direct admin control over a user's subscription, independent of any request:
 * grant extends/activates (like an approved manual payment), revoke deactivates
 * immediately (useSubscription reads non-premium on its next fetch).
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, action, plan } = await req.json();
    if (typeof userId !== 'string' || (action !== 'grant' && action !== 'revoke')) {
      return new Response('bad request', { status: 400 });
    }

    if (action === 'grant') {
      if (!isPlanId(plan)) return new Response('bad request', { status: 400 });
      const months = PLANS[plan].months;
      await withSchemaRetry(() => sql`
        INSERT INTO subscriptions (user_id, provider, plan, status, current_period_end, external_ref, updated_at)
        VALUES (
          ${userId}::uuid, 'manual', ${plan}, 'active',
          now() + make_interval(months => ${months}), 'manual:grant', now()
        )
        ON CONFLICT (user_id) DO UPDATE SET
          provider           = 'manual',
          plan               = EXCLUDED.plan,
          status             = 'active',
          current_period_end = GREATEST(COALESCE(subscriptions.current_period_end, now()), now())
                               + make_interval(months => ${months}),
          external_ref       = 'manual:grant',
          updated_at         = now()
      `);
    } else {
      await withSchemaRetry(() => sql`
        UPDATE subscriptions
        SET status = 'inactive', current_period_end = now(), updated_at = now()
        WHERE user_id = ${userId}::uuid
      `);
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('[admin/subscriptions/manage]', err);
    return Response.json({ error: 'query_failed' }, { status: 500 });
  }
}
