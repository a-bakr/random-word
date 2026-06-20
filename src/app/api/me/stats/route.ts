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
    const [totals] = await sql`
      SELECT
        count(*) FILTER (WHERE name IN ('word_generated', 'twister_generated')) AS words,
        count(*) FILTER (WHERE name = 'recording_stopped')                      AS clips
      FROM events
      WHERE user_id = ${userId}::uuid
    `;

    const [duration] = await sql`
      SELECT COALESCE(
        round(sum(extract(epoch FROM (last_seen_at - started_at))) / 60),
        0
      ) AS minutes
      FROM sessions
      WHERE user_id = ${userId}::uuid
    `;

    const days = await sql`
      SELECT DISTINCT (ts AT TIME ZONE 'UTC')::date::text AS d
      FROM events
      WHERE user_id = ${userId}::uuid
      ORDER BY d
    `;

    const activeDays: string[] = days.map(r => r.d);
    const { streak, bestStreak } = computeStreaks(activeDays);

    return Response.json({
      streak,
      bestStreak,
      words: Number(totals?.words ?? 0),
      minutes: Number(duration?.minutes ?? 0),
      clips: Number(totals?.clips ?? 0),
      activeDays,
    });
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
