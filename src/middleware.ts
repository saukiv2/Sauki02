import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // List of protected API routes that require authentication
  const protectedPaths = [
    '/api/admin',
    '/api/wallet',
    '/api/cart',
    '/api/orders',
    '/api/data/purchase',
    '/api/electricity/pay',
    '/api/notifications',
    '/api/users',
    '/api/categories',
  ];

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedRoute) {
    try {
      // Get session token from cookie
      const sessionToken = request.cookies.get('auth_session')?.value;

      console.log(`[Middleware] Checking session for ${pathname}`);

      if (!sessionToken) {
        console.log(`[Middleware] ✗ No session token for ${pathname}`);
        return NextResponse.json(
          { message: 'Not authenticated' },
          { status: 401 }
        );
      }

      // Import database
      const { prisma } = await import('@/lib/db');

      // Look up session in database
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });

      if (!session) {
        console.log(`[Middleware] ✗ Session not found for ${pathname}`);
        return NextResponse.json(
          { message: 'Session not found' },
          { status: 401 }
        );
      }

      // Check if session expired
      if (new Date() > session.expiresAt) {
        console.log(`[Middleware] ✗ Session expired for ${pathname}`);
        return NextResponse.json(
          { message: 'Session expired' },
          { status: 401 }
        );
      }

      console.log(`[Middleware] ✓ Session valid for user ${session.userId} accessing ${pathname}`);

      // Add user info to headers for downstream routes
      const response = NextResponse.next();
      response.headers.set('x-user-id', session.userId);
      response.headers.set('x-user-role', session.user.role);
      response.headers.set('x-user-email', session.user.email);

      return response;
    } catch (error) {
      console.error(`[Middleware] Error checking session:`, error);
      return NextResponse.json(
        { message: 'Authentication failed' },
        { status: 401 }
      );
    }
  }

  // Non-protected routes pass through
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
