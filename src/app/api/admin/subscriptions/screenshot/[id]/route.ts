import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CONTENT_TYPES: Record<string, string> = {
  png: 'image/png',
  webp: 'image/webp',
  jpg: 'image/jpeg',
};

/**
 * Serves a db-stored payment screenshot (screenshot_data bytea — the fallback
 * used when the payment-proofs bucket is unusable). Admin-only via the
 * /api/admin gate in src/proxy.ts.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return new Response('bad request', { status: 400 });

  try {
    const rows = await sql`
      SELECT screenshot_path, screenshot_data FROM subscription_requests WHERE id = ${id}::uuid
    `;
    const row = rows[0];
    if (!row?.screenshot_data) return new Response('not found', { status: 404 });

    const ext = String(row.screenshot_path).split('.').pop() ?? 'jpg';
    return new Response(row.screenshot_data as Buffer, {
      headers: {
        'Content-Type': CONTENT_TYPES[ext] ?? 'image/jpeg',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[admin/subscriptions/screenshot]', err);
    return new Response('error', { status: 500 });
  }
}
