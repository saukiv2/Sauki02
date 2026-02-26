import { NextRequest, NextResponse } from 'next/server';

// Middleware is temporarily disabled for testing
// All routes are currently public
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

// Only apply to API routes we care about
export const config = {
  matcher: [
    '/api/admin/:path*',
  ],
};
