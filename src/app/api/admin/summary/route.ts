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
  // All scalar counts share a single scan of the window (now/today are subsets
  // of the interval window) — one query instead of five, to ease pool pressure.
  const [
    counts,
    events, countries, referrers, devices, browsers, oses, utmSources,
  ] = await Promise.all([
    sql`
      SELECT
        count(distinct session_id) FILTER (WHERE ts > now() - INTERVAL '5 minutes') AS now,
        count(distinct session_id) FILTER (WHERE ts >= current_date)                AS today,
        count(distinct session_id)                                                  AS period,
        count(distinct user_id) FILTER (WHERE ts >= current_date AND user_id IS NOT NULL) AS users_today,
        count(distinct user_id) FILTER (WHERE user_id IS NOT NULL)                        AS users_period
      FROM events
      WHERE ts > now() - ${interval}::interval
    `,
    sql`
      SELECT name, count(*) AS n FROM events
      WHERE ts > now() - ${interval}::interval
      GROUP BY name ORDER BY n DESC
    `,
    // Distributions read from the per-session `sessions` rollup (one row per
    // session → cheap count(*), no distinct over events).
    sql`
      SELECT country, count(*) AS n FROM sessions
      WHERE started_at > now() - ${interval}::interval AND country IS NOT NULL
      GROUP BY country ORDER BY n DESC LIMIT 8
    `,
    sql`
      SELECT referrer, count(*) AS n FROM sessions
      WHERE started_at > now() - ${interval}::interval AND referrer IS NOT NULL
      GROUP BY referrer ORDER BY n DESC LIMIT 8
    `,
    sql`
      SELECT device, count(*) AS n FROM sessions
      WHERE started_at > now() - ${interval}::interval AND device IS NOT NULL
      GROUP BY device ORDER BY n DESC
    `,
    sql`
      SELECT browser, count(*) AS n FROM sessions
      WHERE started_at > now() - ${interval}::interval AND browser IS NOT NULL
      GROUP BY browser ORDER BY n DESC LIMIT 8
    `,
    // `os` is only on events (not in the sessions rollup) — single distinct query.
    sql`
      SELECT os, count(distinct session_id) AS n FROM events
      WHERE ts > now() - ${interval}::interval AND os IS NOT NULL
      GROUP BY os ORDER BY n DESC LIMIT 8
    `,
    sql`
      SELECT utm_source, count(*) AS n FROM sessions
      WHERE started_at > now() - ${interval}::interval AND utm_source IS NOT NULL
      GROUP BY utm_source ORDER BY n DESC LIMIT 8
    `,
  ]);

  const c = counts[0] ?? {};
  return Response.json({
    now:     Number(c.now ?? 0),
    today:   Number(c.today ?? 0),
    period:  Number(c.period ?? 0),
    users_today:  Number(c.users_today ?? 0),
    users_period: Number(c.users_period ?? 0),
    events:  events.map(r => ({ name: r.name as string, n: Number(r.n) })),
    countries: countries.map(r => ({ country: r.country as string, n: Number(r.n) })),
    referrers: referrers.map(r => ({ referrer: r.referrer as string, n: Number(r.n) })),
    devices: devices.map(r => ({ device: r.device as string, n: Number(r.n) })),
    browsers: browsers.map(r => ({ browser: r.browser as string, n: Number(r.n) })),
    oses: oses.map(r => ({ os: r.os as string, n: Number(r.n) })),
    utm_sources: utmSources.map(r => ({ utm_source: r.utm_source as string, n: Number(r.n) })),
  });
  } catch (err) {
    console.error('[admin/summary] query failed:', err);
    return Response.json({ error: 'query_failed' }, { status: 500 });
  }
}
