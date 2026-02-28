import { NextRequest, NextResponse } from 'next/server';

export interface AuthPayload {
  userId: string;
  role: string;
}

/**
 * Extract user info from middleware-injected headers
 * Middleware validates the auth cookie and injects these headers
 */
export function getUserFromRequest(request: NextRequest): AuthPayload | null {
  try {
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role') || 'CUSTOMER';
    
    if (!userId) return null;
    return { userId, role };
  } catch {
    return null;
  }
}

/**
 * Ensure user is authenticated and optionally has specific role
 * Note: Middleware has already validated auth cookie and injected headers
 * This function just checks the injected headers
 */
export function requireAuth(request: NextRequest, requiredRole?: string): AuthPayload | NextResponse {
  const user = getUserFromRequest(request);
  
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (requiredRole && user.role !== requiredRole) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  return user;
}

/**
 * Alias: fetch full user record from DB (used by some route handlers)
 */
export async function getFullUserFromRequest(request: NextRequest) {
  const payload = getUserFromRequest(request);
  if (!payload) return null;
  try {
    const { prisma } = await import('@/lib/db');
    return await prisma.user.findUnique({ where: { id: payload.userId } });
  } catch {
    return null;
  }
}
