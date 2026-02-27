import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  try {
    console.log('[Auth/Logout] Processing logout...');

    const refreshToken = request.cookies.get('sm_refresh')?.value;

    if (refreshToken) {
      try {
        const { hashToken } = await import('@/lib/auth');
        const { prisma } = await import('@/lib/db');
        const tokenHash = hashToken(refreshToken);
        await prisma.session.deleteMany({ where: { tokenHash } });
        console.log('[Auth/Logout] Session cleaned up');
      } catch (error) {
        console.error('[Auth/Logout] Error cleaning session:', error);
      }
    }

    // Clear both cookies properly with maxAge=0
    const response = NextResponse.json({ message: 'Logout successful' });
    response.cookies.set('sm_access', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 0,
      path: '/',
    });
    response.cookies.set('sm_refresh', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 0,
      path: '/',
    });

    console.log('[Auth/Logout] Cookies cleared');
    return response;
  } catch (error) {
    console.error('[Auth/Logout] Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
