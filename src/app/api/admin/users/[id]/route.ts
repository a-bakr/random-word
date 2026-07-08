import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
  const [profile, sessions, events, subscription] = await Promise.all([
    sql`SELECT id, is_anonymous, email, display_name, country, created_at, last_seen_at FROM profiles WHERE id = ${id}::uuid`,
    sql`
      SELECT session_id, started_at, last_seen_at, country, device, browser, language,
             pageviews, words, recordings
      FROM sessions WHERE user_id = ${id}::uuid
      ORDER BY started_at DESC LIMIT 50
    `,
    sql`
      SELECT name, ts, path, props, language
      FROM events WHERE user_id = ${id}::uuid
      ORDER BY ts DESC LIMIT 100
    `,
    sql`
      SELECT provider, plan, status, current_period_end
      FROM subscriptions WHERE user_id = ${id}::uuid
    `,
  ]);

  return Response.json({
    profile: profile[0] ?? null,
    sessions,
    events,
    subscription: subscription[0] ?? null,
  });
  } catch (err) {
    console.error('[admin/users/[id]] query failed:', err);
    return Response.json({ error: 'query_failed' }, { status: 500 });
  }
}
