import { NextRequest, NextResponse } from 'next/server';
import { createStaticVirtualAccount } from '@/lib/flutterwave';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, phone, pin, bvn } = body;

    console.log('[Register] Signup attempt - phone:', phone);

    // Validate input
    if (!firstName || !lastName || !phone || !pin || !bvn) {
      return NextResponse.json(
        { message: 'All fields required: firstName, lastName, phone, pin, bvn' },
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

    // Validate BVN is 11 digits
    if (!/^\d{11}$/.test(bvn)) {
      return NextResponse.json(
        { message: 'BVN must be exactly 11 digits' },
        { status: 400 }
      );
    }

    // Validate phone format (basic)
    if (!/^\d{10,15}$/.test(phone.replace(/\D/g, ''))) {
      return NextResponse.json(
        { message: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    console.log('[Register] ✓ Input validation passed');

    // Import dependencies
    const { prisma } = await import('@/lib/db');
    const { hashPassword } = await import('@/lib/auth');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      console.log('[Register] User already exists:', phone);
      return NextResponse.json(
        { message: 'Phone number already registered' },
        { status: 409 }
      );
    }

    console.log('[Register] ✓ User does not exist, creating Flutterwave account...');

    // Create Flutterwave static virtual account
    // Note: BVN is NEVER stored - only used to create the account
    const flwResponse = await createStaticVirtualAccount({
      email: `accounts@saukimart.online`, // Generic email
      phone,
      firstName,
      lastName,
      bvn, // WARNING: This is only for account creation, we don't store BVN
      userId: `signup-${Date.now()}`, // Temporary ID for tx_ref uniqueness
    });

    if (!flwResponse) {
      console.error('[Register] Failed to create Flutterwave account');
      return NextResponse.json(
        { message: 'Failed to create virtual account. Please try again.' },
        { status: 500 }
      );
    }

    console.log('[Register] ✓ Flutterwave account created:', {
      accountNumber: flwResponse.accountNumber,
      bankName: flwResponse.bankName,
    });

    // Hash the PIN
    const pinHash = await hashPassword(pin);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: `accounts@saukimart.online`, // Generic email
        phone,
        passwordHash: pinHash, // Store PIN hash
        pin, // Also store PIN for reference (TODO: consider removing in production)
        // BVN is NOT stored as per user requirement
        role: 'CUSTOMER',
        isVerified: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
      },
    });

    console.log('[Register] ✓ User created:', newUser.id);

    // Create wallet with Flutterwave account details
    const wallet = await prisma.wallet.create({
      data: {
        userId: newUser.id,
        balanceKobo: 0,
        currency: 'NGN',
        flwAccountNumber: flwResponse.accountNumber,
        flwBankName: flwResponse.bankName,
        flwOrderRef: flwResponse.orderRef,
        flwTxRef: flwResponse.txRef,
        flwRef: flwResponse.flwRef,
        flwCreatedAt: new Date(),
      },
    });

    console.log('[Register] ✓ Wallet created with Flutterwave account');

    // Create auth cookie and log user in automatically
    const authData = Buffer.from(
      JSON.stringify({ userId: newUser.id, loginTime: Date.now() })
    ).toString('base64');

    // Return success response
    const response = NextResponse.json(
      {
        message: 'Registration successful!',
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phone: newUser.phone,
          role: newUser.role,
        },
        wallet: {
          accountNumber: wallet.flwAccountNumber,
          bankName: wallet.flwBankName,
        },
      },
      { status: 201 }
    );

    // Set auth cookie
    response.cookies.set('auth', authData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    console.log('[Register] ✓ Signup successful for user:', newUser.id);
    return response;
  } catch (error) {
    console.error('[Register] Error:', error);
    return NextResponse.json(
      { message: 'Signup failed. Please try again.' },
      { status: 500 }
    );
  }
}
