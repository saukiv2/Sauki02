import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware-injected header
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

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
        balanceKobo: wallet.balanceKobo,
        balanceNaira: wallet.balanceKobo / 100,
        currency: wallet.currency,
        flwAccountNumber: wallet.flwAccountNumber,
        flwBankName: wallet.flwBankName,
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
