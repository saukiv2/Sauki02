import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, phone, password, bvn } = body;

    if (!fullName || !email || !phone || !password || !bvn) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Lazy load all dependencies to avoid build-time issues
    const { hashPassword, generateAccessToken, generateRefreshToken, hashToken } = await import('@/lib/auth');
    const { prisma } = await import('@/lib/db');
    const axios = await import('axios').then(m => m.default);
    const { v4: uuidv4 } = await import('uuid');

    const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY || '';
    const FLW_BASE_URL = 'https://api.flutterwave.com/v3';

    const [firstName, ...lastNameParts] = fullName.trim().split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // BVN verification
    const bvnReference = `SM-BVN-${uuidv4()}`;
    let flwIdentityRef: string;

    try {
      const bvnResponse = await axios.post(`${FLW_BASE_URL}/identity-verifications`, {
        type: 'BVN',
        reference: bvnReference,
        record: { number: bvn, firstname: firstName, lastname: lastName, phone },
      }, {
        headers: { Authorization: `Bearer ${FLW_SECRET_KEY}`, 'Content-Type': 'application/json' },
      });

      if (bvnResponse.data.data.status !== 'verified') {
        return NextResponse.json({ message: 'BVN verification failed' }, { status: 400 });
      }
      flwIdentityRef = bvnResponse.data.data.reference;
    } catch (error) {
      console.error('BVN error:', error);
      return NextResponse.json({ message: 'BVN verification failed' }, { status: 400 });
    }

    // Virtual account
    const vaReference = `SM-VA-${uuidv4()}`;
    let flwAccountNumber: string, flwBankName: string, flwOrderRef: string;

    try {
      const vaResponse = await axios.post(`${FLW_BASE_URL}/virtual-account-numbers`, {
        email, tx_ref: vaReference, phonenumber: phone, firstname: firstName,
        lastname: lastName, narration: `SaukiMart Wallet - ${fullName}`, is_permanent: true, bvn,
      }, {
        headers: { Authorization: `Bearer ${FLW_SECRET_KEY}`, 'Content-Type': 'application/json' },
      });
      flwAccountNumber = vaResponse.data.data.account_number;
      flwBankName = vaResponse.data.data.bank_name;
      flwOrderRef = vaResponse.data.data.order_ref;
    } catch (error) {
      console.error('VA error:', error);
      return NextResponse.json({ message: 'Failed to create virtual account' }, { status: 500 });
    }

    // Create user and wallet
    const passwordHash = await hashPassword(password);
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName, email, phone, passwordHash, role: 'CUSTOMER',
          isVerified: true, isSuspended: false, agentApplicationPending: false, flwIdentityRef,
        },
      });
      const wallet = await tx.wallet.create({
        data: { userId: user.id, balanceKobo: 0, currency: 'NGN', flwAccountNumber, flwBankName, flwOrderRef },
      });
      return { user, wallet };
    });

    const accessToken = generateAccessToken({ userId: result.user.id, email, role: 'CUSTOMER' });
    const refreshTokenFinal = generateRefreshToken({ userId: result.user.id, email, role: 'CUSTOMER' });
    const refreshTokenHash = hashToken(refreshTokenFinal);

    await prisma.session.create({
      data: { userId: result.user.id, tokenHash: refreshTokenHash, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });

    const response = NextResponse.json({
      message: 'Registration successful',
      user: { id: result.user.id, fullName, email, phone, role: 'CUSTOMER' },
      accessToken,
      wallet: { balanceKobo: 0, flwAccountNumber, flwBankName },
    }, { status: 201 });

    response.cookies.set('sm_refresh', refreshTokenFinal, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
