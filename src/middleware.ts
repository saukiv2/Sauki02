import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  role: string;
  email: string;
}

function verifyAuth(token: string): TokenPayload | null {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
    const payload = jwt.verify(token, secret) as TokenPayload;
    return payload;
  } catch (error) {
    console.error('[Middleware] Token verification failed');
    return null;
  }
}

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

  // Check if this is a protected route
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedRoute) {
    try {
      // Get access token from HTTP-only cookie
      const accessToken = request.cookies.get('sm_access')?.value;

      if (!accessToken) {
        console.log('[Middleware] Missing auth token for', pathname);
        return NextResponse.json(
          { message: 'Missing authentication token' },
          { status: 401 }
        );
      }

      const payload = verifyAuth(accessToken);

      if (!payload || !payload.userId) {
        console.log('[Middleware] Invalid token for', pathname);
        return NextResponse.json(
          { message: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Clone request and add user info to headers for downstream handlers
      const response = NextResponse.next();
      response.headers.set('x-user-id', payload.userId);
      response.headers.set('x-user-role', payload.role || 'CUSTOMER');
      response.headers.set('x-user-email', payload.email);

      return response;
    } catch (error) {
      console.error('[Middleware] Auth validation error:', error);
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
  matcher: [
    '/api/:path*',
  ],
};
