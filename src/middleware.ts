import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/zen') && !pathname.startsWith('/api/zen')) {
    return NextResponse.next();
  }

  const auth = request.headers.get('authorization') ?? '';
  if (!auth.startsWith('Basic ')) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Zen"' },
    });
  }

  const decoded = atob(auth.slice(6));
  const sep = decoded.indexOf(':');
  const user = decoded.slice(0, sep);
  const pass = decoded.slice(sep + 1);

  if (user !== process.env.ZEN_USER || pass !== process.env.ZEN_PASS) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Zen"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/zen/:path*', '/api/zen/:path*'],
};
