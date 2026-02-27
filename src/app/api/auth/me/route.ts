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

    console.log('[Auth/ME] Session check: token exists=', !!accessToken);
    if (!accessToken) {
      console.log('[Auth/ME] ✗ No access token in cookies, returning 401');
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify and decode token
    let decoded: TokenPayload;
    try {
      const secret = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
      decoded = jwt.verify(accessToken, secret) as TokenPayload;
      console.log('[Auth/ME] ✓ Token verified for user:', decoded.userId);
    } catch (jwtError: any) {
      console.error('[Auth/ME] ✗ JWT verification failed:', jwtError.message);
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Lazy import
    const { prisma } = await import('@/lib/db');

    // Get full user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { wallet: true },
    });

    if (!user) {
      console.log('[Auth/ME] ✗ User not found:', decoded.userId);
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    if (user.isSuspended) {
      console.log('[Auth/ME] ✗ User suspended:', decoded.userId);
      return NextResponse.json(
        { message: 'User suspended' },
        { status: 403 }
      );
    }

    console.log('[Auth/ME] ✓ Returning user data:', user.id);
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
    console.error('[Auth/ME] ✗ Unexpected error:', error);
    return NextResponse.json(
      { message: 'Failed to get user' },
      { status: 500 }
    );
  }
}
