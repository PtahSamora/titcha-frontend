import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = req.nextUrl;

  console.log('[Middleware] Path:', url.pathname, 'Token:', token ? `Present (role: ${token.role})` : 'Missing');

  // Allow login, register, API routes, and auth callbacks to pass without checks
  if (
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/register') ||
    url.pathname.startsWith('/api/auth') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/static') ||
    url.pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Allow public routes (home, features, pricing, etc.)
  if (
    url.pathname === '/' ||
    url.pathname.startsWith('/features') ||
    url.pathname.startsWith('/pricing') ||
    url.pathname.startsWith('/about') ||
    url.pathname.startsWith('/contact') ||
    url.pathname.startsWith('/terms') ||
    url.pathname.startsWith('/privacy') ||
    url.pathname.startsWith('/forgot-password')
  ) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users trying to access /portal
  if (!token) {
    console.log('[Middleware] No token - redirecting to /login');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Normalize role to lowercase for consistent matching
  const role = (token.role as string)?.toLowerCase();

  // Redirect /portal to correct dashboard based on user role
  if (url.pathname === '/portal' || url.pathname === '/portal/') {
    const dashboardUrl = `/portal/${role}/dashboard`;
    console.log('[Middleware] Redirecting /portal to:', dashboardUrl);
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }

  // For other /portal/* routes, let the client-side session guards handle role checks
  // This prevents middleware from competing with client-side redirects
  console.log('[Middleware] Allowing access to:', url.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
