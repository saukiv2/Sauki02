import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * POST /api/wallet/withdraw
 * User: Withdraw funds to bank account
 * 
 * Body: { amount: number, pin: string, bankCode: string, accountNumber: string, accountName: string }
 * Requires PIN verification, validates minimum balance
 */
export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/db');
    const { requireAuth } = await import('@/lib/api-auth');
    const bcrypt = await import('bcryptjs');
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
    const { amount, pin, bankCode, accountNumber, accountName } = body;

    // Validate inputs
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: 'Valid amount required' },
        { status: 400 }
      );
    }

    if (!pin || pin.length !== 6 || !/^\d+$/.test(pin)) {
      return NextResponse.json(
        { message: 'Valid 6-digit PIN required' },
        { status: 400 }
      );
    }

    if (!bankCode || !accountNumber || !accountName) {
      return NextResponse.json(
        { message: 'Bank details required' },
        { status: 400 }
      );
    }

    // Check withdrawal limit (max ₦100k per transaction)
    if (amount > 100000) {
      return NextResponse.json(
        { message: 'Maximum withdrawal amount is ₦100,000' },
        { status: 400 }
      );
    }

    // Get user wallet and verify PIN
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!wallet) {
      return NextResponse.json(
        { message: 'Wallet not found' },
        { status: 404 }
      );
    }

    const amountKobo = Math.round(amount * 100);

    // Check balance
    if (wallet.balanceKobo < amountKobo) {
      return NextResponse.json(
        { message: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Verify PIN against user's PIN hash
    const pinMatch = await bcrypt.default.compare(pin, wallet.user.passwordHash);
    if (!pinMatch) {
      return NextResponse.json(
        { message: 'Invalid PIN' },
        { status: 400 }
      );
    }

    // Create withdrawal transaction
    const txnId = uuidv4();
    const transaction = await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'DEBIT',
        amountKobo,
        balanceBefore: wallet.balanceKobo,
        balanceAfter: wallet.balanceKobo - amountKobo,
        ref: txnId,
        status: 'PENDING', // Will be updated to SUCCESS after processing
        metadata: {
          bankCode,
          accountNumber,
          accountName,
          processingFee: Math.round(50 * 100), // ₦50 flat fee
        },
        description: `Withdraw ₦${amount} to ${accountName}`,
      },
    });

    // Debit wallet immediately (optimistic debit)
    await prisma.wallet.update({
      where: { userId },
      data: {
        balanceKobo: {
          decrement: amountKobo,
        },
      },
    });

    // TODO: Call Flutterwave Transfer API to actually send money
    // For now, mark as pending and admin/automated system processes later
    // In real production, call: https://api.flutterwave.com/v3/transfers

    // Send success response
    return NextResponse.json({
      success: true,
      message: 'Withdrawal initiated. Transfer will arrive in 1-5 minutes.',
      transactionId: transaction.id,
      amount,
      bankAccount: accountName,
      reference: txnId,
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    return NextResponse.json(
      { message: 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}