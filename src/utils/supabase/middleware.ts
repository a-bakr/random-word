import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// getUser() calls the Supabase Auth API over the network. If it is slow or
// unreachable the client's own timeout is ~10s, which would stall EVERY matched
// navigation for that long. Cap it well below that and fail open (no user):
// pages self-gate client-side, and /api/admin/* then 403s (fail-closed, safe).
const AUTH_REFRESH_TIMEOUT_MS = 4000;

/**
 * Refreshes the Supabase auth session on every request and returns a response
 * with updated session cookies, plus the current user (for admin gating).
 * Must NOT run logic between client creation and `getUser()` (per @supabase/ssr).
 */
export async function getSession(
  request: NextRequest,
): Promise<{ response: NextResponse; user: User | null }> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  let user: User | null = null;
  try {
    const { data } = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('auth getUser timed out')), AUTH_REFRESH_TIMEOUT_MS),
      ),
    ]);
    user = data.user;
  } catch (err) {
    // Network blip / auth API down: don't hang the request. Continue unauthenticated.
    console.warn('[auth] session refresh failed, continuing without user:', (err as Error).message);
  }
  return { response, user };
}
