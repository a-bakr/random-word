import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

function intervalFor(window: string) {
  if (window === '24h') return '24 hours';
  if (window === '30d') return '30 days';
  return '7 days';
}

export async function GET(req: NextRequest) {
  const window = req.nextUrl.searchParams.get('window') ?? '7d';
  const interval = intervalFor(window);

  try {
  const [funnel, byMode, byLang, depth] = await Promise.all([
    // Conversion funnel over distinct sessions: visit -> practice -> record.
    sql`
      SELECT
        count(distinct session_id) FILTER (WHERE name = 'pageview')                            AS visited,
        count(distinct session_id) FILTER (WHERE name IN ('word_generated', 'twister_generated')) AS practiced,
        count(distinct session_id) FILTER (WHERE name = 'recording_stopped')                   AS recorded
      FROM events
      WHERE ts > now() - ${interval}::interval
    `,
    // Mode engagement: practice events grouped by mode.
    sql`
      SELECT
        coalesce(props->>'mode', CASE WHEN name = 'twister_generated' THEN 'twisters' ELSE 'words' END) AS mode,
        count(*) AS n
      FROM events
      WHERE name IN ('word_generated', 'twister_generated') AND ts > now() - ${interval}::interval
      GROUP BY 1 ORDER BY n DESC
    `,
    // Language split of word practice.
    sql`
      SELECT coalesce(language, 'unknown') AS lang, count(*) AS n
      FROM events
      WHERE name = 'word_generated' AND ts > now() - ${interval}::interval
      GROUP BY 1 ORDER BY n DESC
    `,
    // Average events per session (engagement depth).
    sql`
      SELECT coalesce(avg(c), 0) AS avg_events
      FROM (
        SELECT count(*) AS c FROM events
        WHERE ts > now() - ${interval}::interval
        GROUP BY session_id
      ) s
    `,
  ]);

  const f = funnel[0] ?? {};
  return Response.json({
    funnel: {
      visited: Number(f.visited ?? 0),
      practiced: Number(f.practiced ?? 0),
      recorded: Number(f.recorded ?? 0),
    },
    by_mode: byMode.map(r => ({ mode: r.mode as string, n: Number(r.n) })),
    by_language: byLang.map(r => ({ language: r.lang as string, n: Number(r.n) })),
    avg_events_per_session: Number(depth[0]?.avg_events ?? 0),
  });
  } catch (err) {
    console.error('[admin/funnels] query failed:', err);
    return Response.json({ error: 'query_failed' }, { status: 500 });
  }
}
