import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import {
  purchaseDataViaAmigo,
  validatePhoneNumber,
  formatPhoneNumber,
} from '@/lib/amigo';
import { sendDataPurchaseNotification } from '@/lib/notify';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


const purchaseSchema = z.object({
  planId: z.string().min(1, 'Plan ID required'),
  phoneNumber: z.string().min(10, 'Invalid phone number'),
});

/**
 * POST /api/data/purchase
 * Purchase mobile data top-up
 * 
 * Request body:
 * {
 *   planId: string,
 *   phoneNumber: string
 * }
 * 
 * Returns: { success: true, reference, amount, provider }
 */
export async function POST(request: NextRequest) {
  try {
    // Get user from middleware header
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request
    const body = await request.json();

    // Validate
    const { planId, phoneNumber } = purchaseSchema.parse(body);

    // Validate phone number format
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!validatePhoneNumber(formattedPhone)) {
      return NextResponse.json(
        { message: 'Invalid phone number format' },
        { status: 400 }
      );
    }

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

    // Get data plan
    const plan = await prisma.dataPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { message: 'Data plan not found or unavailable' },
        { status: 404 }
      );
    }

    // Check user role for pricing
    const userRole = request.headers.get('x-user-role') || 'CUSTOMER';
    const priceKobo =
      userRole === 'AGENT' ? plan.agentPriceKobo : plan.customerPriceKobo;

    // Check wallet balance
    if (user.wallet.balanceKobo < priceKobo) {
      return NextResponse.json(
        {
          message: 'Insufficient wallet balance',
          available: user.wallet.balanceKobo,
          required: priceKobo,
        },
        { status: 402 } // Payment Required
      );
    }

    // Create DataPurchase record in PENDING state
    const idempotencyKey = uuidv4();
    const dataPurchase = await prisma.dataPurchase.create({
      data: {
        userId,
        planId,
        phoneNumber: formattedPhone,
        amountKobo: priceKobo,
        apiProvider: 'AMIGO',
        status: 'PENDING',
      },
    });

    // Deduct from wallet immediately
    const balanceBefore = user.wallet.balanceKobo;
    const balanceAfter = balanceBefore - priceKobo;

    await prisma.wallet.update({
      where: { id: user.wallet.id },
      data: { balanceKobo: balanceAfter },
    });

    // Create wallet transaction (debit)
    const walletTx = await prisma.walletTransaction.create({
      data: {
        walletId: user.wallet.id,
        type: 'DEBIT',
        amountKobo: priceKobo,
        balanceBefore,
        balanceAfter,
        ref: dataPurchase.id,
        description: `Data purchase: ${plan.name} to ${formattedPhone}`,
        status: 'PENDING',
        metadata: {
          planId,
          network: plan.network,
          dataSize: plan.size,
        },
      },
    });

    // Update DataPurchase with wallet transaction ID
    await prisma.dataPurchase.update({
      where: { id: dataPurchase.id },
      data: { walletTxId: walletTx.id },
    });

    let amigoResponse: any;

    try {
      // Call Amigo API to purchase data
      amigoResponse = await purchaseDataViaAmigo(
        formattedPhone,
        plan.network,
        plan.amigoPlanId || planId,
        idempotencyKey
      );

      if (
        amigoResponse.success &&
        amigoResponse.status === 'delivered'
      ) {
        // Update DataPurchase with success
        await prisma.dataPurchase.update({
          where: { id: dataPurchase.id },
          data: {
            status: 'SUCCESS',
            amigoReference: amigoResponse.reference,
            providerResponse: amigoResponse as any,
          },
        });

        // Update wallet transaction to SUCCESS
        await prisma.walletTransaction.update({
          where: { id: walletTx.id },
          data: { status: 'SUCCESS' },
        });

        // Send success notification
        await sendDataPurchaseNotification(
          userId,
          formattedPhone,
          priceKobo / 100,
          'SUCCESS'
        );

        return NextResponse.json({
          success: true,
          message: 'Data purchase successful',
          reference: amigoResponse.reference,
          amount: amigoResponse.amount_charged,
          provider: amigoResponse,
          phone: formattedPhone,
          plan: plan.name,
        });
      } else {
        throw new Error(
          amigoResponse.message || 'Data purchase delivery failed'
        );
      }
    } catch (error) {
      console.error('Data purchase error:', error);

      // Revert wallet transaction to FAILED
      await prisma.walletTransaction.update({
        where: { id: walletTx.id },
        data: { status: 'FAILED' },
      });

      // Credit back to wallet (refund)
      await prisma.wallet.update({
        where: { id: user.wallet.id },
        data: { balanceKobo: balanceBefore },
      });

      // Create refund transaction
      await prisma.walletTransaction.create({
        data: {
          walletId: user.wallet.id,
          type: 'REFUND',
          amountKobo: priceKobo,
          balanceBefore: balanceAfter,
          balanceAfter: balanceBefore,
          ref: dataPurchase.id,
          description: `Refund: Data purchase failed - ${(error as Error).message}`,
          status: 'SUCCESS',
        },
      });

      // Update DataPurchase with failure
      await prisma.dataPurchase.update({
        where: { id: dataPurchase.id },
        data: {
          status: 'FAILED',
          providerResponse: (amigoResponse || { error: (error as Error).message }) as any,
        },
      });

      // Send failure notification
      await sendDataPurchaseNotification(
        userId,
        formattedPhone,
        priceKobo / 100,
        'FAILED'
      );

      return NextResponse.json(
        {
          success: false,
          message: 'Data purchase failed - wallet has been refunded',
          error: (error as Error).message,
          reference: dataPurchase.id,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Data purchase endpoint error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to process data purchase' },
      { status: 500 }
    );
  }
}
