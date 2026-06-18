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

  // Admin area: must be signed in as the admin email (Supabase Auth / Google).
  if (isAdminPath && !isAdminEmail(user?.email)) {
    if (pathname.startsWith('/api/admin')) {
      return new NextResponse('Forbidden', { status: 403 });
    }
    return NextResponse.redirect(new URL('/', request.url));
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
