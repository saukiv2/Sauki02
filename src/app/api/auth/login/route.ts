import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation';
import { verifyPassword, generateAccessToken, generateRefreshToken, hashToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // STEP 1: Rate limiting - 5 attempts per 15 minutes per IP
    const rateLimit = checkRateLimit(ip, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }

    // STEP 2: Validate input
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // STEP 3: Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallet: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // STEP 4: Check if suspended
    if (user.isSuspended) {
      return NextResponse.json(
        { message: 'Your account has been suspended' },
        { status: 403 }
      );
    }

    // STEP 5: Verify password
    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // STEP 6: Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // STEP 7: Hash and store refresh token
    const tokenHash = hashToken(refreshToken);
    
    // Delete old sessions for this user to clean up
    await prisma.session.deleteMany({
      where: {
        userId: user.id,
        expiresAt: { lt: new Date() },
      },
    });

    // Create new session
    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        deviceInfo: request.headers.get('user-agent') || undefined,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // STEP 8: Return response with cookie
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        accessToken,
        wallet: user.wallet
          ? {
              balanceKobo: user.wallet.balanceKobo,
              flwAccountNumber: user.wallet.flwAccountNumber,
              flwBankName: user.wallet.flwBankName,
            }
          : null,
      },
      { status: 200 }
    );

    // Set HTTP-only refresh token cookie
    response.cookies.set('sm_refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
