import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * GET /api/users
 * Admin: Get all users
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request, 'ADMIN');
    if (authResult instanceof NextResponse) return authResult;

    const users = await prisma.user.findMany({
      select: { id: true, fullName: true, email: true, phone: true, role: true, isVerified: true, isSuspended: true, createdAt: true },
    });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}

