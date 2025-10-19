import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Protected portal routes - require authentication
    if (path.startsWith('/portal')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
      }

      // Role-based access control
      const role = token.role as string;

      // Extract the portal type from path: /portal/student/dashboard -> student
      const portalType = path.split('/')[2];

      // Check if user has access to this portal
      if (portalType && role !== portalType) {
        // Redirect to their correct portal
        const correctPortal = `/portal/${role}/dashboard`;
        return NextResponse.redirect(new URL(correctPortal, req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        const path = req.nextUrl.pathname;

        if (path.startsWith('/portal')) {
          return !!token;
        }

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
