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

    // Lazy load auth functions
    const { verifyRefreshToken, generateAccessToken, hashToken } = await import('@/lib/auth');
    const { prisma } = await import('@/lib/db');

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const tokenHash = hashToken(refreshToken);
    const session = await prisma.session.findFirst({
      where: { userId: payload.userId, tokenHash, expiresAt: { gt: new Date() } },
    });

    if (!session) {
      return NextResponse.json({ message: 'Session expired' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { wallet: true },
    });

    if (!user || user.isSuspended) {
      return NextResponse.json({ message: 'User not found or suspended' }, { status: 401 });
    }

    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      message: 'Token refreshed',
      accessToken: newAccessToken,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
