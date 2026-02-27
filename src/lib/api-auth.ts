import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './db';
import { verifyAccessToken } from './auth';

export interface AuthPayload {
  userId: string;
  role: string;
}

/**
 * Extract and verify JWT from Authorization header
 */
export function getUserFromRequest(request: NextRequest): AuthPayload | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    
    if (!payload?.userId) return null;
    return { userId: payload.userId, role: payload.role || 'CUSTOMER' };
  } catch {
    return null;
  }
}

/**
 * Ensure user is authenticated and optionally has specific role
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
    return await prisma.user.findUnique({ where: { id: payload.userId } });
  } catch {
    return null;
  }
}
