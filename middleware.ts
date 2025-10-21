import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    console.log('[Middleware] Path:', path, 'Token:', token ? 'Present' : 'Missing');

    // Protected portal routes - require authentication
    if (path.startsWith('/portal')) {
      if (!token) {
        console.log('[Middleware] No token, redirecting to login');
        return NextResponse.redirect(new URL('/login', req.url));
      }

      // Role-based access control
      const role = (token.role as string)?.toLowerCase(); // Normalize to lowercase
      console.log('[Middleware] User role:', role);

      // If user visits /portal exactly, redirect to their role-specific dashboard
      if (path === '/portal' || path === '/portal/') {
        const correctPortal = `/portal/${role}/dashboard`;
        console.log('[Middleware] Redirecting /portal to:', correctPortal);
        return NextResponse.redirect(new URL(correctPortal, req.url));
      }

      // Extract the portal type from path: /portal/student/dashboard -> student
      const portalType = path.split('/')[2];

      // Check if user has access to this portal
      if (portalType && role !== portalType) {
        // Redirect to their correct portal
        const correctPortal = `/portal/${role}/dashboard`;
        console.log('[Middleware] Wrong portal, redirecting to:', correctPortal);
        return NextResponse.redirect(new URL(correctPortal, req.url));
      }

      console.log('[Middleware] Access granted to:', path);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // For portal routes, require authentication
        if (path.startsWith('/portal')) {
          const isAuthorized = !!token;
          console.log('[Middleware] authorized() check for', path, ':', isAuthorized);
          return isAuthorized;
        }

        // Allow all other routes
        return true;
      },
    },
  }
);

// Protect these routes
export const config = {
  matcher: [
    '/portal/:path*',
  ],
};
