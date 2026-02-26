import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';


/**
 * GET /api/data/history
 * Get user's data purchase history
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - status: Filter by status (PENDING, SUCCESS, FAILED)
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from middleware header
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const status = searchParams.get('status');

    const where: any = { userId };

    if (status) {
      where.status = status.toUpperCase();
    }

    // Get total count
    const total = await prisma.dataPurchase.count({ where });

    // Get purchases
    const purchases = await prisma.dataPurchase.findMany({
      where,
      include: {
        plan: {
          select: {
            name: true,
            network: true,
            size: true,
            validity: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Format response
    const formatted = purchases.map((p) => ({
      id: p.id,
      plan: p.plan.name,
      network: p.plan.network,
      size: p.plan.size,
      validity: `${p.plan.validity} days`,
      phone: p.phoneNumber,
      amount: (p.amountKobo / 100).toFixed(2),
      amountKobo: p.amountKobo,
      status: p.status,
      reference: p.amigoReference || p.id,
      provider: p.apiProvider,
      date: p.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Data history error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch data purchase history' },
      { status: 500 }
    );
  }
}
