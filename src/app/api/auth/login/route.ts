import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    console.log('[Login] Attempting login with phone:', phone);

    // Validate input
    if (!phone || !password) {
      return NextResponse.json(
        { message: 'Phone and password required' },
        { status: 400 }
      );
    }

    // Import database and auth utilities
    const { prisma } = await import('@/lib/db');
    const { verifyPassword } = await import('@/lib/auth');
    const { randomBytes } = await import('crypto');

    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { wallet: true },
    });

    if (!user) {
      console.log('[Login] User not found:', phone);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const passwordMatch = await verifyPassword(password, user.passwordHash);
    if (!passwordMatch) {
      console.log('[Login] Password mismatch for user:', user.id);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    if (user.isSuspended) {
      console.log('[Login] User suspended:', user.id);
      return NextResponse.json({ message: 'Account suspended' }, { status: 403 });
    }

    console.log('[Login] ✓ Credentials verified, creating session');

    // Generate a random session token (32 bytes = 64 hex chars)
    const sessionToken = randomBytes(32).toString('hex');

    // Create session in database - expires in 30 days
    await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    console.log('[Login] ✓ Session created, setting cookie');

    // Create response with session token cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

    // Set session cookie (7 days for cookie expiry, 30 days for server session)
    response.cookies.set('auth_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    console.log('[Login] ✓ Login successful for user:', user.id);
    return response;
  } catch (error) {
    console.error('[Login] Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
