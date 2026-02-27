import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('sm_access')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify and decode token
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as TokenPayload;

    // Lazy import
    const { prisma } = await import('@/lib/db');

    // Get full user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { wallet: true },
    });

    if (!user || user.isSuspended) {
      return NextResponse.json(
        { message: 'User not found or suspended' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      wallet: user.wallet ? { balanceKobo: user.wallet.balanceKobo } : null,
    });
  } catch (error) {
    console.error('[Auth/ME] Error:', error);
    return NextResponse.json(
      { message: 'Failed to get user' },
      { status: 401 }
    );
  }
}
