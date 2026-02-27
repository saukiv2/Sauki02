import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * GET /api/admin/stats
 * Admin: Platform stats for dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request, 'ADMIN');
    if (authResult instanceof NextResponse) return authResult;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalUsers = await prisma.user.count();
    const newUsersThisMonth = await prisma.user.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    const totalOrders = await prisma.order.count();
    const ordersThisMonth = await prisma.order.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    const totalRevenueData = await prisma.order.aggregate({ _sum: { amount: true } });
    const totalRevenueKobo = totalRevenueData._sum.amount || 0;

    const monthRevenueData = await prisma.order.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    });
    const revenueThisMonthKobo = monthRevenueData._sum.amount || 0;

    const startOfLastMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() - 1, 1);
    const lastMonthRevenueData = await prisma.order.aggregate({
      where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
      _sum: { amount: true },
    });
    const lastMonthRevenueKobo = lastMonthRevenueData._sum.amount || 1;
    const revenueChangePercent = lastMonthRevenueKobo > 0
      ? Math.round(((revenueThisMonthKobo - lastMonthRevenueKobo) / lastMonthRevenueKobo) * 100)
      : 0;

    const failedTransactions = await prisma.order.count({
      where: { status: { in: ['CANCELLED', 'FAILED'] } },
    });
    const pendingOrders = await prisma.order.count({
      where: { status: 'PENDING' },
    });

    const totalCategories = await prisma.category.count();
    const totalProducts = await prisma.product.count({ where: { isActive: true } });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, phone: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        newUsersThisMonth,
        totalRevenueKobo,
        revenueThisMonthKobo,
        revenueChangePercent,
        totalOrders,
        ordersThisMonth,
        failedTransactions,
        pendingOrders,
        totalCategories,
        totalProducts,
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ message: 'Failed to fetch stats' }, { status: 500 });
  }
}
