import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { sql } from '@/lib/db';
import { PLANS, isPlanId } from '@/lib/billing';

export const runtime = 'nodejs';

const PAYMOB_INTENTION_URL = 'https://accept.paymob.com/v1/intention/';
const PAYMOB_CHECKOUT_URL = 'https://accept.paymob.com/unifiedcheckout/';

/**
 * Creates a Paymob payment intention for the signed-in user and returns the hosted
 * Unified Checkout URL. Records a `pending` payments row keyed by a unique
 * special_reference; the webhook reconciles it into a subscription on success.
 */
export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json();
    if (!isPlanId(plan)) return new Response('bad request', { status: 400 });

    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response('unauthorized', { status: 401 });

    const { amount } = PLANS[plan];
    const specialReference = `${user.id}:${plan}:${Date.now()}`;
    const origin = req.nextUrl.origin;

    await sql`
      INSERT INTO payments (user_id, plan, amount_cents, currency, status, special_reference)
      VALUES (${user.id}::uuid, ${plan}, ${amount}, 'EGP', 'pending', ${specialReference})
    `;

    const integrationIds = (process.env.PAYMOB_INTEGRATION_IDS ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(Number);

    const body = {
      amount,
      currency: 'EGP',
      payment_methods: integrationIds,
      items: [
        { name: `Faseeh Premium (${plan})`, amount, description: 'Faseeh Premium subscription', quantity: 1 },
      ],
      billing_data: {
        first_name: user.user_metadata?.full_name?.split(' ')[0] ?? 'Faseeh',
        last_name: 'User',
        email: user.email ?? `${user.id}@faseeh.app`,
        phone_number: '+201000000000',
        apartment: 'NA', floor: 'NA', street: 'NA', building: 'NA',
        city: 'Cairo', country: 'EG', state: 'NA', postal_code: 'NA',
      },
      extras: { user_id: user.id, plan, special_reference: specialReference },
      special_reference: specialReference,
      notification_url: `${origin}/api/webhooks/paymob`,
      redirection_url: `${origin}/?checkout=done`,
    };

    const res = await fetch(PAYMOB_INTENTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${process.env.PAYMOB_SECRET_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error('[checkout] paymob intention failed', res.status, await res.text());
      await sql`UPDATE payments SET status = 'failed', updated_at = now() WHERE special_reference = ${specialReference}`;
      return new Response('payment provider error', { status: 502 });
    }

    const data = await res.json();
    const url = `${PAYMOB_CHECKOUT_URL}?publicKey=${process.env.PAYMOB_PUBLIC_KEY}&clientSecret=${data.client_secret}`;
    return Response.json({ url });
  } catch (err) {
    console.error('[checkout]', err);
    return new Response('error', { status: 500 });
  }
}
