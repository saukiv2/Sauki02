import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('sm_refresh')?.value;

    if (!refreshToken) {
      return NextResponse.json({ message: 'Refresh token missing' }, { status: 401 });
    }

    // Lazy load dependencies
    const { hashToken, generateAccessToken } = await import('@/lib/auth');
    const { prisma } = await import('@/lib/db');

    // Hash token and look up session
    const tokenHash = hashToken(refreshToken);
    const session = await prisma.session.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
      include: { user: { include: { wallet: true } } },
    });

    if (!session) {
      return NextResponse.json({ message: 'Session invalid or expired' }, { status: 401 });
    }

    const user = session.user;

    if (user.isSuspended) {
      return NextResponse.json({ message: 'User suspended' }, { status: 401 });
    }

    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      message: 'Token refreshed',
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

    // Set new access token as HTTP-only cookie
    response.cookies.set('sm_access', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
