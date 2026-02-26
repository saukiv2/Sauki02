import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sendElectricityNotification } from '@/lib/notify';
import { validateCustomer, sendBillPaymentAdvice, parseDisco } from '@/lib/interswitch';
import { z } from 'zod';


const paySchema = z.object({
  disco: z.string().min(1, 'DisCo required'),
  meterNo: z.string().min(3, 'Meter number required'),
  amountNaira: z.number().min(100, 'Minimum payment is ₦100'),
  customerCode: z.string().optional(),
});

/**
 * POST /api/electricity/pay
 * Process electricity bill payment
 *
 * Request:
 * {
 *   disco: "IKEJA",
 *   meterNo: "12345678901",
 *   amountNaira: 5000,
 *   customerCode: "CUST123"
 * }
 *
 * Response:
 * { token, reference, amount, disco, meterNo }
 */
export async function POST(request: NextRequest) {
  try {
    // Get user from middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { disco: discoInput, meterNo, amountNaira, customerCode } = paySchema.parse(body);

    // Parse disco
    const disco = parseDisco(discoInput);

    // Get user with wallet
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      return NextResponse.json(
        { message: 'User or wallet not found' },
        { status: 404 }
      );
    }

    const amountKobo = Math.round(amountNaira * 100);

    // Check wallet balance
    if (user.wallet.balanceKobo < amountKobo) {
      return NextResponse.json(
        {
          message: 'Insufficient wallet balance',
          available: (user.wallet.balanceKobo / 100).toFixed(2),
          required: amountNaira.toFixed(2),
        },
        { status: 402 }
      );
    }

    // Validate customer (to get accurate code if not provided)
    let finalCustomerCode = customerCode;
    try {
      const customerData = await validateCustomer(meterNo, disco);
      finalCustomerCode = customerData.customerCode;
    } catch (error) {
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400 }
      );
    }

    // Generate transaction reference
    const txRef = `ELC-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // Create ElectricityPurchase record in PENDING state
    const elecPurchase = await prisma.electricityPurchase.create({
      data: {
        userId,
        disco,
        iswBillerId: 506, // Default, will be queried
        iswPaymentCode: txRef,
        meterNo,
        customerName: '', // Will update after Interswitch response
        amountKobo,
        serviceChargeKobo: 0,
        status: 'PENDING',
        iswRequestRef: txRef,
      },
    });

    // Deduct from wallet immediately
    const balanceBefore = user.wallet.balanceKobo;
    const balanceAfter = balanceBefore - amountKobo;

    await prisma.wallet.update({
      where: { id: user.wallet.id },
      data: { balanceKobo: balanceAfter },
    });

    // Create wallet debit transaction
    const walletTx = await prisma.walletTransaction.create({
      data: {
        walletId: user.wallet.id,
        type: 'DEBIT',
        amountKobo,
        balanceBefore,
        balanceAfter,
        ref: elecPurchase.id,
        description: `Electricity bill: ${disco} meter ${meterNo}`,
        status: 'PENDING',
        metadata: {
          disco,
          meterNo,
        },
      },
    });

    // Update electricity purchase with wallet tx
    await prisma.electricityPurchase.update({
      where: { id: elecPurchase.id },
      data: { walletTxId: walletTx.id },
    });

    let token: string = '';
    let iswResponse;

    try {
      // Send bill payment advice to Interswitch
      iswResponse = await sendBillPaymentAdvice(
        meterNo,
        disco,
        amountNaira,
        txRef,
        finalCustomerCode || meterNo
      );

      token = iswResponse.token;

      // Update electricity purchase to SUCCESS
      await prisma.electricityPurchase.update({
        where: { id: elecPurchase.id },
        data: {
          status: 'SUCCESS',
          iswResponseCode: iswResponse.reference,
          token: token || null,
        },
      });

      // Update wallet transaction to SUCCESS
      await prisma.walletTransaction.update({
        where: { id: walletTx.id },
        data: { status: 'SUCCESS' },
      });

      // Send success notification
      await sendElectricityNotification(
        userId,
        meterNo,
        amountNaira,
        'SUCCESS',
        token
      );

      return NextResponse.json({
        success: true,
        message: 'Electricity bill payment successful',
        token: token,
        reference: iswResponse.reference,
        amount: amountNaira,
        disco,
        meterNo,
      });
    } catch (error) {
      console.error('Electricity payment error:', error);

      // Revert wallet transaction to FAILED
      await prisma.walletTransaction.update({
        where: { id: walletTx.id },
        data: { status: 'FAILED' },
      });

      // Refund wallet
      await prisma.wallet.update({
        where: { id: user.wallet.id },
        data: { balanceKobo: balanceBefore },
      });

      // Create refund transaction
      await prisma.walletTransaction.create({
        data: {
          walletId: user.wallet.id,
          type: 'REFUND',
          amountKobo,
          balanceBefore: balanceAfter,
          balanceAfter: balanceBefore,
          ref: elecPurchase.id,
          description: `Refund: Electricity payment failed - ${(error as Error).message}`,
          status: 'SUCCESS',
        },
      });

      // Update electricity purchase to FAILED
      await prisma.electricityPurchase.update({
        where: { id: elecPurchase.id },
        data: {
          status: 'FAILED',
          iswResponseCode: (error as Error).message,
        },
      });

      // Send failure notification
      await sendElectricityNotification(
        userId,
        meterNo,
        amountNaira,
        'FAILED'
      );

      return NextResponse.json(
        {
          success: false,
          message: 'Electricity payment failed - wallet has been refunded',
          error: (error as Error).message,
          reference: elecPurchase.id,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Electricity endpoint error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to process electricity payment' },
      { status: 500 }
    );
  }
}
