import { prisma } from './db';

/**
 * Get user wallet balance
 */
export async function getWalletBalance(userId: string): Promise<number> {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { balanceKobo: true },
    });
    return wallet?.balanceKobo ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Add funds to wallet
 */
export async function addWalletFunds(
  userId: string,
  amount: number,
  reference: string
): Promise<boolean> {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { balanceKobo: true },
    });

    const balanceBefore = wallet?.balanceKobo ?? 0;
    const balanceAfter = balanceBefore + amount;

    await prisma.wallet.update({
      where: { userId },
      data: {
        balanceKobo: {
          increment: amount,
        },
      },
    });

    // Log transaction
    await prisma.walletTransaction.create({
      data: {
        walletId: (await prisma.wallet.findUnique({ where: { userId } }))?.id || '',
        type: 'CREDIT',
        amountKobo: amount,
        balanceBefore,
        balanceAfter,
        ref: reference,
        description: `Wallet top-up via ${reference}`,
        status: 'SUCCESS',
      },
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Deduct funds from wallet
 */
export async function deductWalletFunds(
  userId: string,
  amount: number,
  reference: string
): Promise<boolean> {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { balanceKobo: true },
    });

    if (!wallet || wallet.balanceKobo < amount) {
      return false;
    }

    const balanceBefore = wallet.balanceKobo;
    const balanceAfter = balanceBefore - amount;

    await prisma.wallet.update({
      where: { userId },
      data: {
        balanceKobo: {
          decrement: amount,
        },
      },
    });

    // Log transaction
    await prisma.walletTransaction.create({
      data: {
        walletId: (await prisma.wallet.findUnique({ where: { userId } }))?.id || '',
        type: 'DEBIT',
        amountKobo: amount,
        balanceBefore,
        balanceAfter,
        ref: reference,
        description: `Wallet debit via ${reference}`,
        status: 'SUCCESS',
      },
    });

    return true;
  } catch {
    return false;
  }
}
