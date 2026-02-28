import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, parseWebhookPayload } from '@/lib/flutterwave';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Webhook handler for Flutterwave virtual account transfers
 * When a customer transfers money to their virtual account, Flutterwave notifies this endpoint
 * We then credit their wallet
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Webhook] Flutterwave webhook received');

    // Verify webhook signature
    const signature = request.headers.get('verif-hash');
    if (!signature || !verifyWebhookSignature(signature)) {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 401 }
      );
    }

    console.log('[Webhook] ✓ Signature verified');

    // Parse payload
    const payload = await request.json();
    const webhookData = parseWebhookPayload(payload);

    if (!webhookData) {
      console.error('[Webhook] Invalid payload');
      return NextResponse.json(
        { message: 'Invalid payload' },
        { status: 400 }
      );
    }

    const { txRef, flwRef, amount, status, customer, event } = webhookData;

    // Only process successful charge completions
    if (event !== 'charge.completed' || status !== 'successful') {
      console.log('[Webhook] Ignoring non-successful event:', event, status);
      return NextResponse.json({ message: 'OK' }, { status: 200 });
    }

    console.log('[Webhook] Processing successful charge:', {
      txRef,
      amount,
      customerPhone: customer?.phone_number,
    });

    // Import dependencies
    const { prisma } = await import('@/lib/db');

    // Find wallet by tx_ref (which we stored as flwTxRef)
    const wallet = await prisma.wallet.findUnique({
      where: { flwTxRef: txRef },
      include: { user: true },
    });

    if (!wallet) {
      console.error('[Webhook] Wallet not found for tx_ref:', txRef);
      // Still return 200 to acknowledge receipt
      return NextResponse.json({ message: 'OK' }, { status: 200 });
    }

    console.log('[Webhook] ✓ Found wallet for user:', wallet.userId);

    // Check if this wallet has already received credit for this specific transaction
    const existingTxn = await prisma.walletTransaction.findFirst({
      where: {
        walletId: wallet.id,
        ref: flwRef,
        status: 'SUCCESS',
      },
    });

    if (existingTxn) {
      console.log('[Webhook] Webhook already processed for flw_ref:', flwRef);
      return NextResponse.json({ message: 'OK' }, { status: 200 });
    }

    // Credit the wallet
    const amountKobo = Math.round(amount * 100);

    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balanceKobo: {
          increment: amountKobo,
        },
      },
    });

    console.log('[Webhook] ✓ Wallet credited:', {
      userId: wallet.userId,
      amount: amount + ' NGN',
      newBalance: updatedWallet.balanceKobo / 100 + ' NGN',
    });

    // Record wallet transaction
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'CREDIT',
        amountKobo,
        balanceBefore: wallet.balanceKobo,
        balanceAfter: updatedWallet.balanceKobo,
        ref: flwRef,
        description: `Flutterwave transfer - ${customer?.name || 'Unknown'}`,
        status: 'SUCCESS',
      },
    });

    console.log('[Webhook] ✓ Transaction recorded and webhook processed successfully');
    return NextResponse.json({ message: 'OK' }, { status: 200 });
  } catch (error) {
    console.error('[Webhook] Error:', error);

    // Still return 200 to acknowledge receipt and prevent retry loops
    return NextResponse.json(
      { message: 'Webhook received, error processing' },
      { status: 200 }
    );
  }
}
