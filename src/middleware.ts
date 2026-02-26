import { NextRequest, NextResponse } from 'next/server';
import type { NextMiddleware } from 'next/server';
import { verifyAccessToken } from './lib/auth';

export const middleware: NextMiddleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = [
    /^\/api\/auth\//,
    /^\/api\/wallet\/webhook$/,
    /^\/landing\//,
    /^\/$/, // home
  ];

  const isPublic = publicRoutes.some(route => route.test(pathname));

  if (isPublic) {
    return NextResponse.next();
  }

  // Get access token from Authorization header
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return NextResponse.json(
      { message: 'Unauthorized: Missing token' },
      { status: 401 }
    );
  }

  // Verify token
  const payload = verifyAccessToken(token);

  if (!payload) {
    return NextResponse.json(
      { message: 'Unauthorized: Invalid or expired token' },
      { status: 401 }
    );
  }

  // Admin-only routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (payload.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
  }

  // Protected wallet routes (customer can only access own wallet)
  if (pathname.startsWith('/api/wallet/') && !pathname.endsWith('/webhook')) {
    // The actual route handler will validate wallet ownership
  }

  // Create response with injected headers
  const response = NextResponse.next();
  response.headers.set('x-user-id', payload.userId);
  response.headers.set('x-user-role', payload.role);
  response.headers.set('x-user-email', payload.email);

  return response;
};

export const config = {
  matcher: [
    // Protect all API routes except public ones
    '/api/:path*',
    // Protect app routes
    '/admin/:path*',
    '/(app)/:path*',
  ],
};
