import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('auth')?.value;

    console.log('[AuthMe] Auth check: cookie present =', !!authCookie);

    if (!authCookie) {
      console.log('[AuthMe] ✗ No auth cookie');
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Decode cookie to get user ID
    let userId;
    try {
      const decoded = JSON.parse(Buffer.from(authCookie, 'base64').toString());
      userId = decoded.userId;
    } catch (e) {
      console.log('[AuthMe] ✗ Invalid cookie format');
      return NextResponse.json({ message: 'Invalid auth' }, { status: 401 });
    }

    // Import database and verify user still exists
    const { prisma } = await import('@/lib/db');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user) {
      console.log('[AuthMe] ✗ User not found');
      return NextResponse.json({ message: 'User not found' }, { status: 401 });
    }

    if (user.isSuspended) {
      console.log('[AuthMe] ✗ User suspended:', user.id);
      return NextResponse.json({ message: 'User suspended' }, { status: 403 });
    }

    console.log('[AuthMe] ✓ Auth valid for user:', user.id);
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
