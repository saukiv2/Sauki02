import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, pin } = body;

    console.log('[Login] Attempting login with phone:', phone);

    // Validate input
    if (!phone || !pin) {
      return NextResponse.json(
        { message: 'Phone and PIN required' },
        { status: 400 }
      );
    }

    // Validate PIN is 6 digits
    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { message: 'PIN must be exactly 6 digits' },
        { status: 400 }
      );
    }

    // Import database and auth utilities
    const { prisma } = await import('@/lib/db');
    const { verifyPassword } = await import('@/lib/auth');

    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { wallet: true },
    });

    if (!user) {
      console.log('[Login] User not found:', phone);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Verify PIN
    const pinMatch = await verifyPassword(pin, user.passwordHash);
    if (!pinMatch) {
      console.log('[Login] PIN mismatch for user:', user.id);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    if (user.isSuspended) {
      console.log('[Login] User suspended:', user.id);
      return NextResponse.json({ message: 'Account suspended' }, { status: 403 });
    }

    console.log('[Login] ✓ Credentials verified, creating auth cookie');

    // Create simple auth cookie with user ID (base64 encoded)
    const authData = Buffer.from(JSON.stringify({ userId: user.id, loginTime: Date.now() })).toString('base64');

    // Create response
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
      wallet: user.wallet
        ? {
            accountNumber: user.wallet.flwAccountNumber,
            bankName: user.wallet.flwBankName,
            balance: user.wallet.balanceKobo / 100,
          }
        : null,
    });

    // Set simple auth cookie
    response.cookies.set('auth', authData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    console.log('[Login] ✓ Login successful for user:', user.id);
    return response;
  } catch (error) {
    console.error('[Login] Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
