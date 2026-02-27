import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * GET /api/orders
 * Admin: Get all orders
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request, 'ADMIN');
    if (authResult instanceof NextResponse) return authResult;

    const orders = await prisma.order.findMany({
      include: { user: { select: { fullName: true, email: true } }, items: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 });
  }
}

