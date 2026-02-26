import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken, hashToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('sm_refresh')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token missing' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        { message: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Check if session exists and is valid
    const tokenHash = hashToken(refreshToken);
    const session = await prisma.session.findFirst({
      where: {
        userId: payload.userId,
        tokenHash,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      return NextResponse.json(
        { message: 'Session not found or expired' },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { wallet: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 401 }
      );
    }

    // Check if suspended
    if (user.isSuspended) {
      return NextResponse.json(
        { message: 'Your account has been suspended' },
        { status: 403 }
      );
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        message: 'Token refreshed',
        accessToken: newAccessToken,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
