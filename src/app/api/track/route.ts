import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

function parseUA(ua: string) {
  const device =
    /iPad|Tablet/.test(ua) ? 'tablet' :
    /Mobile|Android|iPhone/.test(ua) ? 'mobile' :
    'desktop';
  const browser =
    /Edg\//.test(ua) ? 'edge' :
    /Chrome/.test(ua) ? 'chrome' :
    /Firefox/.test(ua) ? 'firefox' :
    /Safari/.test(ua) ? 'safari' :
    'other';
  const os =
    /Android/.test(ua) ? 'android' :
    /iPhone|iPad|iOS/.test(ua) ? 'ios' :
    /Windows/.test(ua) ? 'windows' :
    /Mac/.test(ua) ? 'macos' :
    /Linux/.test(ua) ? 'linux' :
    'other';
  return { device, browser, os };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, session_id, path, referrer, utm_source, utm_medium, utm_campaign, props } = body;
    if (!name || !session_id) return new Response('bad request', { status: 400 });

    const ua = req.headers.get('user-agent') ?? '';
    const { device, browser, os } = parseUA(ua);
    const country = req.headers.get('x-vercel-ip-country') ?? null;
    const region  = req.headers.get('x-vercel-ip-country-region') ?? null;
    const city    = req.headers.get('x-vercel-ip-city') ?? null;

    const safeProps = typeof props === 'object' && props !== null ? props : {};

    await Promise.all([
      sql`
        INSERT INTO events
          (session_id, name, path, referrer, utm_source, utm_medium, utm_campaign,
           country, region, city, device, browser, os, props)
        VALUES
          (${session_id}, ${name}, ${path ?? '/'}, ${referrer ?? null},
           ${utm_source ?? null}, ${utm_medium ?? null}, ${utm_campaign ?? null},
           ${country}, ${region}, ${city}, ${device}, ${browser}, ${os},
           ${JSON.stringify(safeProps)})
      `,
      sql`
        INSERT INTO sessions
          (session_id, started_at, last_seen_at, country, device, browser, referrer, utm_source)
        VALUES
          (${session_id}, now(), now(), ${country}, ${device}, ${browser},
           ${referrer ?? null}, ${utm_source ?? null})
        ON CONFLICT (session_id) DO UPDATE SET
          last_seen_at = now(),
          pageviews  = sessions.pageviews  + CASE WHEN ${name} = 'pageview'           THEN 1 ELSE 0 END,
          words      = sessions.words      + CASE WHEN ${name} = 'word_generated'     THEN 1 ELSE 0 END,
          recordings = sessions.recordings + CASE WHEN ${name} = 'recording_stopped'  THEN 1 ELSE 0 END
      `,
    ]);

    return new Response('ok');
  } catch (err) {
    console.error('[track]', err);
    return new Response('error', { status: 500 });
  }
}
