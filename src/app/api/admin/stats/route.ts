import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * GET /api/admin/stats
 * Admin: Get platform stats
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const totalUsers = await prisma.user.count();
    const totalRevenue = await prisma.order.aggregate({ _sum: { amount: true } });
    const ordersThisMonth = await prisma.order.count({ where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } });
    const failedTransactions = await prisma.order.count({ where: { status: 'FAILED' } });
    return NextResponse.json({ success: true, data: { totalUsers, totalRevenue: totalRevenue._sum.amount || 0, ordersThisMonth, failedTransactions } });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch stats' }, { status: 500 });
  }
}
