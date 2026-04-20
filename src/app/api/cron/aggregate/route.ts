import { sql } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  await sql`
    INSERT INTO daily_stats (day, sessions, pageviews, words, recordings, avg_session_secs)
    SELECT
      (current_date - 1)                                          AS day,
      count(distinct e.session_id)                               AS sessions,
      count(*) FILTER (WHERE e.name = 'pageview')               AS pageviews,
      count(*) FILTER (WHERE e.name = 'word_generated')         AS words,
      count(*) FILTER (WHERE e.name = 'recording_stopped')      AS recordings,
      COALESCE(
        (SELECT extract(epoch FROM avg(s.last_seen_at - s.started_at))
         FROM sessions s
         WHERE s.started_at >= current_date - 1 AND s.started_at < current_date),
        0
      )                                                          AS avg_session_secs
    FROM events e
    WHERE e.ts >= current_date - 1 AND e.ts < current_date
    ON CONFLICT (day) DO UPDATE SET
      sessions         = EXCLUDED.sessions,
      pageviews        = EXCLUDED.pageviews,
      words            = EXCLUDED.words,
      recordings       = EXCLUDED.recordings,
      avg_session_secs = EXCLUDED.avg_session_secs
  `;

  return Response.json({ ok: true });
}
