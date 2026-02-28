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
      // Get auth cookie
      const authCookie = request.cookies.get('auth')?.value;

      console.log(`[Middleware] Checking auth for ${pathname}`);

      if (!authCookie) {
        console.log(`[Middleware] ✗ No auth cookie for ${pathname}`);
        return NextResponse.json(
          { message: 'Not authenticated' },
          { status: 401 }
        );
      }

      // Decode cookie to get user ID
      let userId;
      try {
        const decoded = JSON.parse(Buffer.from(authCookie, 'base64').toString());
        userId = decoded.userId;
      } catch (e) {
        console.log(`[Middleware] ✗ Invalid cookie for ${pathname}`);
        return NextResponse.json(
          { message: 'Invalid auth' },
          { status: 401 }
        );
      }

      // Import database and verify user
      const { prisma } = await import('@/lib/db');
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        console.log(`[Middleware] ✗ User not found for ${pathname}`);
        return NextResponse.json(
          { message: 'User not found' },
          { status: 401 }
        );
      }

      if (user.isSuspended) {
        console.log(`[Middleware] ✗ User suspended for ${pathname}`);
        return NextResponse.json(
          { message: 'User suspended' },
          { status: 403 }
        );
      }

      console.log(`[Middleware] ✓ Auth valid for user ${userId} accessing ${pathname}`);

      // Add user info to headers for downstream routes
      const response = NextResponse.next();
      response.headers.set('x-user-id', userId);
      response.headers.set('x-user-role', user.role);
      response.headers.set('x-user-email', user.email);

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
