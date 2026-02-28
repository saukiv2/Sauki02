import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  try {
    console.log('[Logout] Processing logout');

    const sessionToken = request.cookies.get('auth_session')?.value;

    if (sessionToken) {
      // Delete session from database
      const { prisma } = await import('@/lib/db');
      await prisma.session.deleteMany({ where: { sessionToken } });
      console.log('[Logout] ✓ Session deleted');
    }

    // Clear the cookie
    const response = NextResponse.json({ message: 'Logout successful' });
    response.cookies.set('auth_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    console.log('[Logout] ✓ Cookie cleared');
    return response;
  } catch (error) {
    console.error('[Logout] Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
