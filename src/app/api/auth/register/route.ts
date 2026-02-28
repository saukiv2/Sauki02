import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, password, bvn } = body;

    console.log('[Auth/Register] Starting registration for:', email, phone);

    if (!firstName || !lastName || !email || !phone || !password || !bvn) {
      console.log('[Auth/Register] Missing required fields');
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Validate BVN is 11 digits
    if (bvn.length !== 11 || !/^\d+$/.test(bvn)) {
      console.log('[Auth/Register] Invalid BVN format');
      return NextResponse.json({ message: 'BVN must be 11 digits' }, { status: 400 });
    }

    // Lazy load all dependencies to avoid build-time issues
    const { hashPassword, generateAccessToken, generateRefreshToken, hashToken } = await import('@/lib/auth');
    const { prisma } = await import('@/lib/db');
    const axios = await import('axios').then(m => m.default);
    const { v4: uuidv4 } = await import('uuid');

    const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY || '';
    const FLW_BASE_URL = 'https://api.flutterwave.com/v3';

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      console.log('[Auth/Register] User already exists');
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Create virtual account with BVN
    const vaReference = `SM-VA-${uuidv4()}`;
    let flwAccountNumber: string, flwBankName: string, flwOrderRef: string;

    try {
      const vaResponse = await axios.post(`${FLW_BASE_URL}/virtual-account-numbers`, {
        email,
        tx_ref: vaReference,
        phonenumber: phone,
        firstname: firstName,
        lastname: lastName,
        narration: `SaukiMart Wallet - ${firstName} ${lastName}`,
        is_permanent: true,
        bvn,
      }, {
        headers: { Authorization: `Bearer ${FLW_SECRET_KEY}`, 'Content-Type': 'application/json' },
      });

      if (vaResponse.data.status !== 'success') {
        return NextResponse.json(
          { message: 'Failed to create virtual account', details: vaResponse.data.message },
          { status: 400 }
        );
      }

      flwAccountNumber = vaResponse.data.data.account_number;
      flwBankName = vaResponse.data.data.bank_name;
      flwOrderRef = vaResponse.data.data.order_ref;
    } catch (error: any) {
      console.error('VA error:', error.response?.data || error.message);
      return NextResponse.json(
        { message: 'Failed to create virtual account', details: error.response?.data?.message || error.message },
        { status: 400 }
      );
    }

    // Create user and wallet
    const passwordHash = await hashPassword(password);
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: `${firstName} ${lastName}`,
          email,
          phone,
          passwordHash,
          role: 'CUSTOMER',
          isVerified: true,
          isSuspended: false,
          agentApplicationPending: false,
        },
      });
      const wallet = await tx.wallet.create({
        data: {
          userId: user.id,
          balanceKobo: 0,
          currency: 'NGN',
          flwAccountNumber,
          flwBankName,
          flwOrderRef,
        },
      });
      return { user, wallet };
    });

    const accessToken = generateAccessToken({ userId: result.user.id, email, role: 'CUSTOMER' });
    const refreshTokenFinal = generateRefreshToken({ userId: result.user.id, email, role: 'CUSTOMER' });
    const refreshTokenHash = hashToken(refreshTokenFinal);

    await prisma.session.create({
      data: {
        userId: result.user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const response = NextResponse.json(
      {
        message: 'Registration successful',
        user: { id: result.user.id, firstName, lastName, email, phone, role: 'CUSTOMER' },
        wallet: { balanceKobo: 0, flwAccountNumber, flwBankName },
      },
      { status: 201 }
    );

    // Set access token (short-lived, 1 hour)
    response.cookies.set('sm_access', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    });

    // Set refresh token (long-lived, 30 days)
    response.cookies.set('sm_refresh', refreshTokenFinal, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    console.log('[Auth/Register] ✓ Registration successful, cookies set for user:', result.user.id);
    return response;
  } catch (error) {
    console.error('[Auth/Register] ✗ Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
