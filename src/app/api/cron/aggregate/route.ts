import { sql } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  await sql`
    INSERT INTO daily_stats
      (day, sessions, users, pageviews, words, recordings, avg_session_secs, words_by_mode, words_by_lang)
    SELECT
      (current_date - 1)                                                 AS day,
      count(distinct e.session_id)                                       AS sessions,
      count(distinct e.user_id) FILTER (WHERE e.user_id IS NOT NULL)     AS users,
      count(*) FILTER (WHERE e.name = 'pageview')                        AS pageviews,
      count(*) FILTER (WHERE e.name = 'word_generated')                  AS words,
      count(*) FILTER (WHERE e.name = 'recording_stopped')               AS recordings,
      COALESCE(
        (SELECT extract(epoch FROM avg(s.last_seen_at - s.started_at))
         FROM sessions s
         WHERE s.started_at >= current_date - 1 AND s.started_at < current_date),
        0
      )                                                                  AS avg_session_secs,
      COALESCE(
        (SELECT jsonb_object_agg(mode, n) FROM (
           SELECT coalesce(props->>'mode', 'unknown') AS mode, count(*) AS n
           FROM events
           WHERE name = 'word_generated' AND ts >= current_date - 1 AND ts < current_date
           GROUP BY 1
        ) m),
        '{}'::jsonb
      )                                                                  AS words_by_mode,
      COALESCE(
        (SELECT jsonb_object_agg(lang, n) FROM (
           SELECT coalesce(language, 'unknown') AS lang, count(*) AS n
           FROM events
           WHERE name = 'word_generated' AND ts >= current_date - 1 AND ts < current_date
           GROUP BY 1
        ) l),
        '{}'::jsonb
      )                                                                  AS words_by_lang
    FROM events e
    WHERE e.ts >= current_date - 1 AND e.ts < current_date
    ON CONFLICT (day) DO UPDATE SET
      sessions         = EXCLUDED.sessions,
      users            = EXCLUDED.users,
      pageviews        = EXCLUDED.pageviews,
      words            = EXCLUDED.words,
      recordings       = EXCLUDED.recordings,
      avg_session_secs = EXCLUDED.avg_session_secs,
      words_by_mode    = EXCLUDED.words_by_mode,
      words_by_lang    = EXCLUDED.words_by_lang
  `;

  return Response.json({ ok: true });
}
