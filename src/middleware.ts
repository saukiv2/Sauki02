import { NextRequest, NextResponse } from 'next/server';
import type { NextMiddleware } from 'next/server';
import { verifyAccessToken } from './lib/auth';

export const middleware: NextMiddleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // Public routes (no middleware check needed)
  const publicRoutes = [
    /^\/api\/auth\//,
    /^\/api\/contact\//,
    /^\/api\/wallet\/webhook$/,
    /^\/landing\//,
    /^\/privacy$/,
    /^\/terms$/,
    /^\/contact$/,
    /^\/$/, // home
    /^\/app-entry$/,
    /^\/auth\//,
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
  try {
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

    // Create response with injected headers
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId);
    response.headers.set('x-user-role', payload.role);
    response.headers.set('x-user-email', payload.email);

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.json(
      { message: 'Unauthorized: Invalid token' },
      { status: 401 }
    );
  }
};

export const config = {
  matcher: [
    // Apply middleware to API routes
    '/api/:path*',
    // Apply middleware to protected app routes (but not home, landing, etc)
    '/admin/:path*',
    '/(app)/:path*',
    '/dashboard/:path*',
    '/store/:path*',
    '/wallet/:path*',
    '/profile/:path*',
    '/data/:path*',
    '/electricity/:path*',
  ],
};
