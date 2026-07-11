import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const window = req.nextUrl.searchParams.get('window') ?? '7d';
  const trunc    = window === '24h' ? 'hour' : 'day';
  const interval = window === '24h' ? '24 hours' : window === '30d' ? '30 days' : window === 'all' ? '100 years' : '7 days';

  try {
    const rows = await sql`
      SELECT
        date_trunc(${trunc}, ts)                                       AS bucket,
        count(distinct session_id)                                     AS sessions,
        count(*) FILTER (WHERE name = 'word_generated')               AS words,
        count(*) FILTER (WHERE name = 'recording_stopped')            AS recordings
      FROM events
      WHERE ts > now() - ${interval}::interval
      GROUP BY bucket
      ORDER BY bucket
    `;

    return Response.json(rows.map(r => ({
      bucket:     r.bucket,
      sessions:   Number(r.sessions),
      words:      Number(r.words),
      recordings: Number(r.recordings),
    })));
  } catch (err) {
    console.error('[admin/timeseries] query failed:', err);
    return Response.json({ error: 'query_failed' }, { status: 500 });
  }
}
