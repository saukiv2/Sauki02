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

    // Fetch wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: {
        balanceKobo: true,
        currency: true,
        flwAccountNumber: true,
        flwBankName: true,
      },
    });

    if (!wallet) {
      return NextResponse.json(
        { message: 'Wallet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          balanceKobo: wallet.balanceKobo,
          balanceNaira: wallet.balanceKobo / 100,
          currency: wallet.currency,
          flwAccountNumber: wallet.flwAccountNumber,
          flwBankName: wallet.flwBankName,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get balance error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
