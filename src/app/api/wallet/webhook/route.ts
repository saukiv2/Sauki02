import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


/**
 * Flutterwave webhook for virtual account deposits
 * POST /api/wallet/webhook
 * 
 * Receives notifications when user's virtual account is credited
 * Credits the wallet and sends push notification
 */
export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/db');
    const { sendWalletCreditNotification } = await import('@/lib/notify');
    
    const FLW_WEBHOOK_HASH = process.env.FLW_WEBHOOK_HASH || '';
    
    // Verify webhook signature
    const signature = request.headers.get('verif-hash');
    
    if (!signature) {
      console.warn('Missing webhook signature');
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 401 }
      );
    }

    const body = await request.text();
    const hash = crypto
      .createHmac('sha256', FLW_WEBHOOK_HASH)
      .update(body)
      .digest('base64');

    if (hash !== signature) {
      console.warn('Invalid webhook signature');
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);

    // Check webhook type: charge.completed with successful status
    if (data.event !== 'charge.completed' || data.data?.status !== 'successful') {
      console.log(`Ignoring webhook event: ${data.event} with status: ${data.data?.status}`);
      return NextResponse.json({ message: 'Ignored' }, { status: 200 });
    }

    const txData = data.data;

    // Find wallet by Flutterwave order_ref
    const wallet = await prisma.wallet.findFirst({
      where: { flwOrderRef: txData.order_ref },
      include: { user: true },
    });

    if (!wallet) {
      console.warn(`Wallet not found for order_ref: ${txData.order_ref}`);
      return NextResponse.json({ message: 'Wallet not found' }, { status: 404 });
    }

    // Create FlutterwaveDeposit record
    const deposit = await prisma.flutterwaveDeposit.create({
      data: {
        walletId: wallet.id,
        flwRef: txData.tx_ref,
        flwTxId: txData.id.toString(),
        amountKobo: Math.round(parseFloat(txData.amount) * 100), // Convert to kobo
        originatorName: txData.meta_data?.originatorname,
        originatorAccount: txData.meta_data?.originatoraccountnumber,
        bankName: txData.meta_data?.bankname,
        status: 'SUCCESS',
        webhookReceivedAt: new Date(),
      },
    });

    // Credit wallet
    const balanceBefore = wallet.balanceKobo;
    const amountKobo = Math.round(parseFloat(txData.amount) * 100);
    const balanceAfter = balanceBefore + amountKobo;

    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balanceKobo: balanceAfter },
    });

    // Create WalletTransaction record
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'CREDIT',
        amountKobo,
        balanceBefore,
        balanceAfter,
        ref: txData.tx_ref,
        description: `Bank deposit from ${txData.meta_data?.originatorname || txData.meta_data?.originatoraccountnumber}`,
        status: 'SUCCESS',
        metadata: {
          bankName: txData.meta_data?.bankname,
          originatorAccount: txData.meta_data?.originatoraccountnumber,
          flwDepositId: deposit.id,
        },
      },
    });

    // Send push notification to user
    await sendWalletCreditNotification(
      wallet.userId,
      amountKobo,
      txData.tx_ref
    );

    console.log(
      `Wallet credited: ${wallet.user.email} +₦${(amountKobo / 100).toFixed(2)}`
    );

    return NextResponse.json(
      { message: 'Webhook processed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
