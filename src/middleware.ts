import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-change-in-production');

async function verifyAuth(token: string) {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as any;
  } catch (error) {
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
      const authHeader = request.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json(
          { message: 'Missing or invalid authorization header' },
          { status: 401 }
        );
      }

      const token = authHeader.slice(7);
      const payload = await verifyAuth(token);

      if (!payload || !payload.userId) {
        return NextResponse.json(
          { message: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Clone request and add user ID to headers
      const requestWithUser = request.clone();
      const response = NextResponse.next({ request: requestWithUser });
      response.headers.set('x-user-id', payload.userId);
      response.headers.set('x-user-role', payload.role || 'CUSTOMER');

      return response;
    } catch (error) {
      console.error('Auth middleware error:', error);
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
