import { sql } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const rows = await sql`
      SELECT name, country, device, browser, ts
      FROM events
      ORDER BY ts DESC
      LIMIT 20
    `;
    return Response.json(rows);
  } catch (err) {
    console.error('[admin/feed] query failed:', err);
    return Response.json({ error: 'query_failed' }, { status: 500 });
  }
}
