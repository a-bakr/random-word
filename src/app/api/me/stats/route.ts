import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * Per-user practice stats for the "Your Practice" dashboard. Reads the analytics
 * tables (events / sessions) for the currently signed-in Supabase user — including
 * anonymous users, who still have a real auth.uid().
 */
export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 });

  try {
    // Single round-trip: word/clip counts + distinct active days from `events`,
    // practice minutes from the `sessions` rollup. Collapsing the three queries
    // into one CTE cuts pooler latency to a single hop.
    const [row] = await sql`
      WITH ev AS (
        SELECT name, (ts AT TIME ZONE 'UTC')::date::text AS d
        FROM events
        WHERE user_id = ${userId}::uuid
      )
      SELECT
        (SELECT count(*) FILTER (WHERE name IN ('word_generated', 'twister_generated')) FROM ev) AS words,
        (SELECT count(*) FILTER (WHERE name = 'recording_stopped') FROM ev)                      AS clips,
        (SELECT array_agg(DISTINCT d ORDER BY d) FROM ev)                                        AS days,
        (
          SELECT COALESCE(round(sum(extract(epoch FROM (last_seen_at - started_at))) / 60), 0)
          FROM sessions
          WHERE user_id = ${userId}::uuid
        ) AS minutes
    `;

    const activeDays: string[] = row?.days ?? [];
    const { streak, bestStreak } = computeStreaks(activeDays);

    return Response.json(
      {
        streak,
        bestStreak,
        words: Number(row?.words ?? 0),
        minutes: Number(row?.minutes ?? 0),
        clips: Number(row?.clips ?? 0),
        activeDays,
      },
      {
        // Per-user data → private. Serve instantly from cache for a few seconds,
        // then allow a stale copy while revalidating in the background.
        headers: { 'Cache-Control': 'private, max-age=15, stale-while-revalidate=60' },
      },
    );
  } catch (err) {
    console.error('[me/stats] query failed:', err);
    return Response.json({ error: 'query_failed' }, { status: 500 });
  }
}

/** Current streak (run ending today or yesterday, UTC) and the longest run ever. */
function computeStreaks(isoDays: string[]): { streak: number; bestStreak: number } {
  if (isoDays.length === 0) return { streak: 0, bestStreak: 0 };

  const DAY = 86_400_000;
  const dayNums = [...new Set(isoDays)]
    .map(d => Math.floor(Date.parse(d + 'T00:00:00Z') / DAY))
    .sort((a, b) => a - b);

  let best = 1;
  let run = 1;
  for (let i = 1; i < dayNums.length; i++) {
    run = dayNums[i] === dayNums[i - 1] + 1 ? run + 1 : 1;
    if (run > best) best = run;
  }

  const today = Math.floor(Date.now() / DAY);
  const last = dayNums[dayNums.length - 1];
  let current = 0;
  if (last === today || last === today - 1) {
    current = 1;
    for (let i = dayNums.length - 1; i > 0; i--) {
      if (dayNums[i] === dayNums[i - 1] + 1) current++;
      else break;
    }
  }

  return { streak: current, bestStreak: best };
}
