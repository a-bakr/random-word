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

  const [now, today, period, events, countries, referrers] = await Promise.all([
    sql`SELECT count(distinct session_id) AS n FROM events WHERE ts > now() - INTERVAL '5 minutes'`,
    sql`SELECT count(distinct session_id) AS n FROM events WHERE ts >= current_date`,
    sql`SELECT count(distinct session_id) AS n FROM events WHERE ts > now() - ${interval}::interval`,
    sql`
      SELECT name, count(*) AS n FROM events
      WHERE ts > now() - ${interval}::interval
      GROUP BY name ORDER BY n DESC
    `,
    sql`
      SELECT country, count(distinct session_id) AS n FROM events
      WHERE ts > now() - ${interval}::interval AND country IS NOT NULL
      GROUP BY country ORDER BY n DESC LIMIT 8
    `,
    sql`
      SELECT referrer, count(distinct session_id) AS n FROM events
      WHERE ts > now() - ${interval}::interval AND referrer IS NOT NULL
      GROUP BY referrer ORDER BY n DESC LIMIT 8
    `,
  ]);

  return Response.json({
    now:     Number(now[0]?.n ?? 0),
    today:   Number(today[0]?.n ?? 0),
    period:  Number(period[0]?.n ?? 0),
    events:  events.map(r => ({ name: r.name as string, n: Number(r.n) })),
    countries: countries.map(r => ({ country: r.country as string, n: Number(r.n) })),
    referrers: referrers.map(r => ({ referrer: r.referrer as string, n: Number(r.n) })),
  });
}
