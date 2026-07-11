import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

function intervalFor(window: string) {
  if (window === '24h') return '24 hours';
  if (window === '30d') return '30 days';
  if (window === 'all') return '100 years';
  return '7 days';
}

export async function GET(req: NextRequest) {
  const window = req.nextUrl.searchParams.get('window') ?? '7d';
  const interval = intervalFor(window);

  try {
  const [totals, list] = await Promise.all([
    sql`
      SELECT
        count(*)                                  AS total,
        count(*) FILTER (WHERE NOT is_anonymous)  AS registered,
        count(*) FILTER (WHERE is_anonymous)      AS anonymous,
        count(*) FILTER (WHERE created_at >= current_date) AS new_today
      FROM profiles
    `,
    sql`
      SELECT
        e.user_id,
        p.is_anonymous,
        p.email,
        p.display_name,
        count(distinct e.session_id)                            AS sessions,
        count(*) FILTER (WHERE e.name = 'word_generated')       AS words,
        count(*) FILTER (WHERE e.name = 'recording_stopped')    AS recordings,
        min(e.ts)                                               AS first_seen,
        max(e.ts)                                               AS last_seen
      FROM events e
      LEFT JOIN profiles p ON p.id = e.user_id
      WHERE e.user_id IS NOT NULL AND e.ts > now() - ${interval}::interval
      GROUP BY e.user_id, p.is_anonymous, p.email, p.display_name
      ORDER BY last_seen DESC
      LIMIT 100
    `,
  ]);

  const t = totals[0] ?? {};
  const users = list.map(r => ({
    user_id: r.user_id as string,
    is_anonymous: r.is_anonymous !== false,
    email: (r.email as string | null) ?? null,
    display_name: (r.display_name as string | null) ?? null,
    sessions: Number(r.sessions),
    words: Number(r.words),
    recordings: Number(r.recordings),
    returning: Number(r.sessions) > 1,
    first_seen: r.first_seen,
    last_seen: r.last_seen,
  }));

  return Response.json({
    totals: {
      total: Number(t.total ?? 0),
      registered: Number(t.registered ?? 0),
      anonymous: Number(t.anonymous ?? 0),
      new_today: Number(t.new_today ?? 0),
    },
    returning: users.filter(u => u.returning).length,
    users,
  });
  } catch (err) {
    console.error('[admin/users] query failed:', err);
    return Response.json({ error: 'query_failed' }, { status: 500 });
  }
}
