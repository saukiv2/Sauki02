import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('auth_session')?.value;

    console.log('[AuthMe] Session check: token present =', !!sessionToken);

    if (!sessionToken) {
      console.log('[AuthMe] ✗ No session token');
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Import database
    const { prisma } = await import('@/lib/db');

    // Look up session in database
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session) {
      console.log('[AuthMe] ✗ Session not found in database');
      return NextResponse.json({ message: 'Session not found' }, { status: 401 });
    }

    // Check if session expired
    if (new Date() > session.expiresAt) {
      console.log('[AuthMe] ✗ Session expired');
      await prisma.session.delete({ where: { id: session.id } });
      return NextResponse.json({ message: 'Session expired' }, { status: 401 });
    }

    const user = session.user;

    if (user.isSuspended) {
      console.log('[AuthMe] ✗ User suspended:', user.id);
      return NextResponse.json({ message: 'User suspended' }, { status: 403 });
    }

    console.log('[AuthMe] ✓ Session valid for user:', user.id);
    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[AuthMe] Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
