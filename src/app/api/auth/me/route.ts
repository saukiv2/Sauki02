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
    const refreshToken = request.cookies.get('sm_refresh')?.value;

    console.log('[Auth/ME] Session check at:', new Date().toISOString());
    console.log('[Auth/ME] Access token present:', !!accessToken);
    console.log('[Auth/ME] Refresh token present:', !!refreshToken);
    
    if (!accessToken) {
      console.log('[Auth/ME] ✗ No access token in cookies, attempting refresh...');
      
      // If no access token but have refresh token, try to refresh
      if (refreshToken) {
        console.log('[Auth/ME] Attempting to use refresh token...');
        // Could implement auto-refresh here, for now just return 401
      }
      
      return NextResponse.json(
        { message: 'Not authenticated - no access token' },
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
      console.log('[Auth/ME] Token value (first 50 chars):', accessToken.substring(0, 50) + '...');
      return NextResponse.json(
        { message: 'Invalid token: ' + jwtError.message },
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
      console.log('[Auth/ME] ✗ User not found in database:', decoded.userId);
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    if (user.isSuspended) {
      console.log('[Auth/ME] ✗ User account suspended:', decoded.userId);
      return NextResponse.json(
        { message: 'User account suspended' },
        { status: 403 }
      );
    }

    console.log('[Auth/ME] ✓ Returning user data for:', user.id);
    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      wallet: user.wallet ? { balanceKobo: user.wallet.balanceKobo } : null,
    });
  } catch (error) {
    console.error('[Auth/ME] ✗ Unexpected error:', error);
    return NextResponse.json(
      { message: 'Failed to get user', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
