import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { message: 'Phone and password required' },
        { status: 400 }
      );
    }

    // Lazy import - avoid loading at build time
    const { prisma } = await import('@/lib/db');
    const { verifyPassword, generateAccessToken, generateRefreshToken, hashToken } = await import('@/lib/auth');
    const { checkRateLimit } = await import('@/lib/rate-limit');

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimit = checkRateLimit(ip, 5, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: 'Too many login attempts' },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { phone },
      include: { wallet: true },
    });

    if (!user || !await verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { message: 'Account suspended' },
        { status: 403 }
      );
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });
    const tokenHash = hashToken(refreshToken);

    await prisma.session.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } });
    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Set both tokens as HTTP-only cookies (secure, not accessible by JavaScript)
    const response = NextResponse.json({
      message: 'Login successful',
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

    // Set access token (short-lived, 1 hour)
    response.cookies.set('sm_access', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60,
      path: '/',
    });

    // Set refresh token (long-lived, 30 days)
    response.cookies.set('sm_refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
