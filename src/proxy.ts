import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/utils/supabase/middleware';
import { isAdminEmail } from '@/lib/admin';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');

  // Non-admin API routes: no session work needed (keeps /api/track fast).
  if (!isAdminPath && pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const { response, user } = await getSession(request);

  // Admin API is the real security boundary: gate it by the admin email.
  // The /admin *page* always renders — it self-gates client-side (showing the
  // Google sign-in screen to signed-out / non-admin visitors), so it is not
  // redirected here; otherwise signed-out admins could never reach sign-in.
  if (pathname.startsWith('/api/admin') && !isAdminEmail(user?.email)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and audio files.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:wav|png|jpg|jpeg|svg|gif|webp|ico|txt|xml)).*)',
  ],
};
