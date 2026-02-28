import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(_request: NextRequest) {
  try {
    console.log('[Logout] Processing logout');

    // Clear the auth cookie
    const response = NextResponse.json({ message: 'Logout successful' });
    response.cookies.set('auth', '', {
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
