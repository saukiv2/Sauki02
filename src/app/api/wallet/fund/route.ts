import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * POST /api/wallet/fund
 * User: Submit manual transfer proof to fund wallet
 * 
 * Body: { amount: number, transactionRef: string, screenshot?: string | null }
 * After user manually transfers to Flutterwave account, this creates a pending fund request
 * Admin reviews and approves/rejects in wallet management
 */
export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/db');
    const { requireAuth } = await import('@/lib/api-auth');
    const { v4: uuidv4 } = await import('uuid');

    const authResult = requireAuth(request, 'USER');
    if (authResult instanceof NextResponse) return authResult;

    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { message: 'User not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, transactionRef } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: 'Valid amount required' },
        { status: 400 }
      );
    }

    if (!transactionRef) {
      return NextResponse.json(
        { message: 'Transaction reference required' },
        { status: 400 }
      );
    }

    // Check limit (max ₦500k per request)
    if (amount > 500000) {
      return NextResponse.json(
        { message: 'Maximum fund amount is ₦500,000' },
        { status: 400 }
      );
    }

    // Create transaction record with PENDING status
    const transaction = await prisma.transaction.create({
      data: {
        id: uuidv4(),
        userId,
        type: 'FUND',
        amount: Math.round(amount * 100), // Store in kobo
        status: 'PENDING',
        metadata: {
          transactionRef,
          method: 'MANUAL_TRANSFER',
          fundType: 'CUSTOMER_FUND',
        },
        description: `Fund wallet - ₦${amount}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Fund request submitted. Admin will review and approve shortly.',
      transactionId: transaction.id,
      status: 'PENDING',
    });
  } catch (error) {
    console.error('Fund wallet error:', error);
    return NextResponse.json(
      { message: 'Failed to submit fund request' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wallet/fund
 * User: Get fund requests status
 */
export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/db');
    const { requireAuth } = await import('@/lib/api-auth');

    const authResult = requireAuth(request, 'USER');
    if (authResult instanceof NextResponse) return authResult;

    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { message: 'User not authenticated' },
        { status: 401 }
      );
    }

    const fundRequests = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'FUND',
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      fundRequests,
    });
  } catch (error) {
    console.error('Get fund requests error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch fund requests' },
      { status: 500 }
    );
  }
}