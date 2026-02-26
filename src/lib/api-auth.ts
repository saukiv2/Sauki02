import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './auth';

/**
 * Extract user ID from Authorization header JWT token
 * Returns null if not authenticated
 */
export function getUserIdFromRequest(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = verifyAccessToken(token);
    
    return payload?.userId || null;
  } catch {
    return null;
  }
}

/**
 * Middleware helper for protected API routes
 * Returns user ID or a 401 response if not authenticated
 */
export function requireAuth(request: NextRequest): string | NextResponse {
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  return userId;
}
