import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const userIdOrResponse = requireAuth(request);
    if (userIdOrResponse instanceof NextResponse) {
      return userIdOrResponse;
    }
    const userId = userIdOrResponse;

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const skip = (page - 1) * limit;

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!wallet) {
      return NextResponse.json(
        { message: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Fetch transactions
    const transactions = await prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      select: {
        id: true,
        type: true,
        amountKobo: true,
        balanceBefore: true,
        balanceAfter: true,
        ref: true,
        description: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Get total count
    const total = await prisma.walletTransaction.count({
      where: { walletId: wallet.id },
    });

    return NextResponse.json(
      {
        success: true,
        data: transactions.map((tx) => ({
          ...tx,
          amountNaira: tx.amountKobo / 100,
          balanceBeforeNaira: tx.balanceBefore / 100,
          balanceAfterNaira: tx.balanceAfter / 100,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
