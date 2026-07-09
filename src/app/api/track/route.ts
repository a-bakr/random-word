import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import { withTimeout } from '@/lib/utils';

export const runtime = 'nodejs';

// Analytics is best-effort: cap the DB writes so an unreachable Postgres can't
// hang the request for the driver's default (~30s) and surface a 500 in the
// client console. On failure we log and return 202 — the client fires this with
// `keepalive` and doesn't need the write to succeed.
const DB_TIMEOUT_MS = 4000;

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
    const { name, session_id, user_id, language, path, referrer, utm_source, utm_medium, utm_campaign, props } = body;
    if (!name || !session_id) return new Response('bad request', { status: 400 });

    const ua = req.headers.get('user-agent') ?? '';
    const { device, browser, os } = parseUA(ua);
    const country = req.headers.get('x-vercel-ip-country') ?? null;
    const region  = req.headers.get('x-vercel-ip-country-region') ?? null;
    const city    = req.headers.get('x-vercel-ip-city') ?? null;

    const safeProps = typeof props === 'object' && props !== null ? props : {};

    await withTimeout(Promise.all([
      sql`
        INSERT INTO events
          (session_id, user_id, name, path, referrer, utm_source, utm_medium, utm_campaign,
           country, region, city, device, browser, os, language, props)
        VALUES
          (${session_id}, ${user_id ?? null}::uuid, ${name}, ${path ?? '/'}, ${referrer ?? null},
           ${utm_source ?? null}, ${utm_medium ?? null}, ${utm_campaign ?? null},
           ${country}, ${region}, ${city}, ${device}, ${browser}, ${os}, ${language ?? null},
           ${JSON.stringify(safeProps)}::jsonb)
      `,
      sql`
        INSERT INTO sessions
          (session_id, user_id, started_at, last_seen_at, country, device, browser, referrer, utm_source, language)
        VALUES
          (${session_id}, ${user_id ?? null}::uuid, now(), now(), ${country}, ${device}, ${browser},
           ${referrer ?? null}, ${utm_source ?? null}, ${language ?? null})
        ON CONFLICT (session_id) DO UPDATE SET
          last_seen_at = now(),
          user_id      = COALESCE(sessions.user_id, EXCLUDED.user_id),
          language     = COALESCE(EXCLUDED.language, sessions.language),
          pageviews    = sessions.pageviews    + CASE WHEN ${name} = 'pageview'          THEN 1 ELSE 0 END,
          words        = sessions.words        + CASE WHEN ${name} = 'word_generated'    THEN 1 ELSE 0 END,
          recordings   = sessions.recordings   + CASE WHEN ${name} = 'recording_stopped' THEN 1 ELSE 0 END,
          mode_changes = sessions.mode_changes + CASE WHEN ${name} = 'mode_changed'      THEN 1 ELSE 0 END
      `,
    ]), DB_TIMEOUT_MS);

    return new Response('ok');
  } catch (err) {
    // Best-effort: swallow DB/network errors so analytics never errors the app.
    console.error('[track]', (err as Error)?.message ?? err);
    return new Response('accepted', { status: 202 });
  }
}
