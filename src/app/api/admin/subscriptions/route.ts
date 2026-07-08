import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import { supabaseAdmin, PAYMENT_PROOFS_BUCKET } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

const STATUSES = new Set(['pending', 'approved', 'rejected']);

export async function GET(req: NextRequest) {
  const statusParam = req.nextUrl.searchParams.get('status') ?? 'pending';
  const status = STATUSES.has(statusParam) ? statusParam : 'pending';

  try {
    const [requestRows, subRows] = await Promise.all([
      sql`
        SELECT r.id, r.user_id, r.plan, r.amount_cents, r.wallet, r.screenshot_path,
               r.status, r.admin_note, r.reviewed_at, r.created_at,
               p.email, p.display_name
        FROM subscription_requests r
        LEFT JOIN profiles p ON p.id = r.user_id
        WHERE r.status = ${status}
        ORDER BY r.created_at DESC
        LIMIT 100
      `,
      sql`
        SELECT s.user_id, s.provider, s.plan, s.status, s.current_period_end, s.updated_at,
               p.email, p.display_name
        FROM subscriptions s
        LEFT JOIN profiles p ON p.id = s.user_id
        ORDER BY s.updated_at DESC
        LIMIT 100
      `,
    ]);

    const storage = supabaseAdmin().storage.from(PAYMENT_PROOFS_BUCKET);
    const requests = await Promise.all(
      requestRows.map(async r => {
        const { data } = await storage.createSignedUrl(r.screenshot_path as string, 3600);
        return {
          id: r.id as string,
          user_id: r.user_id as string,
          email: (r.email as string | null) ?? null,
          display_name: (r.display_name as string | null) ?? null,
          plan: r.plan as string,
          amount_cents: Number(r.amount_cents ?? 0),
          wallet: (r.wallet as string | null) ?? null,
          status: r.status as string,
          admin_note: (r.admin_note as string | null) ?? null,
          reviewed_at: r.reviewed_at,
          created_at: r.created_at,
          screenshot_url: data?.signedUrl ?? null,
        };
      }),
    );

    const subscriptions = subRows.map(s => ({
      user_id: s.user_id as string,
      email: (s.email as string | null) ?? null,
      display_name: (s.display_name as string | null) ?? null,
      provider: s.provider as string,
      plan: (s.plan as string | null) ?? null,
      status: s.status as string,
      current_period_end: s.current_period_end,
      updated_at: s.updated_at,
    }));

    return Response.json({ requests, subscriptions });
  } catch (err) {
    console.error('[admin/subscriptions] query failed:', err);
    return Response.json({ error: 'query_failed' }, { status: 500 });
  }
}
