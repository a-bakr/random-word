import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { withTimeout } from '@/lib/utils';

// If Supabase auth is unreachable, don't block every navigation for the fetch
// driver's full ~10s timeout — fail fast and treat the visitor as signed out.
const AUTH_TIMEOUT_MS = 3000;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

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

  try {
    const { data } = await withTimeout(supabase.auth.getUser(), AUTH_TIMEOUT_MS);
    return { response, user: data.user };
  } catch (err) {
    // Network/timeout reaching Supabase auth: proceed without a session rather
    // than hanging. Admin gating in proxy.ts fails closed (user is null → 403).
    console.error('[middleware] getUser failed:', (err as Error)?.message ?? err);
    return { response, user: null };
  }
}
