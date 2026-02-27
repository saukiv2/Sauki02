import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validation';
import { hashPassword, generateAccessToken, generateRefreshToken, hashToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY || '';
const FLW_BASE_URL = 'https://api.flutterwave.com/v3';

interface FlutterwaveIdentityResponse {
  status: string;
  message: string;
  data: {
    id: number;
    reference: string;
    status: string;
  };
}

interface FlutterwaveVirtualAccountResponse {
  status: string;
  message: string;
  data: {
    account_number: string;
    bank_name: string;
    order_ref: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // STEP 1: Zod validation
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { fullName, email, phone, password, bvn } = validation.data;
    const [firstName, ...lastNameParts] = fullName.trim().split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email or phone already exists' },
        { status: 400 }
      );
    }

    // STEP 2: BVN Verification via Flutterwave
    const bvnReference = `SM-BVN-${uuidv4()}`;

    let flwIdentityRef: string;
    try {
      const bvnResponse = await axios.post<FlutterwaveIdentityResponse>(
        `${FLW_BASE_URL}/identity-verifications`,
        {
          type: 'BVN',
          reference: bvnReference,
          record: {
            number: bvn,
            firstname: firstName,
            lastname: lastName,
            phone,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${FLW_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (bvnResponse.data.data.status !== 'verified') {
        return NextResponse.json(
          { message: 'BVN verification failed' },
          { status: 400 }
        );
      }

      flwIdentityRef = bvnResponse.data.data.reference;
    } catch (error) {
      console.error('BVN verification error:', error);
      return NextResponse.json(
        { message: 'BVN verification failed. Please check your details.' },
        { status: 400 }
      );
    }

    // STEP 3: Create Permanent Flutterwave Virtual Account
    const vaReference = `SM-VA-${uuidv4()}`;

    let flwAccountNumber: string;
    let flwBankName: string;
    let flwOrderRef: string;

    try {
      const vaResponse = await axios.post<FlutterwaveVirtualAccountResponse>(
        `${FLW_BASE_URL}/virtual-account-numbers`,
        {
          email,
          tx_ref: vaReference,
          phonenumber: phone,
          firstname: firstName,
          lastname: lastName,
          narration: `SaukiMart Wallet - ${fullName}`,
          is_permanent: true,
          bvn,
        },
        {
          headers: {
            Authorization: `Bearer ${FLW_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      flwAccountNumber = vaResponse.data.data.account_number;
      flwBankName = vaResponse.data.data.bank_name;
      flwOrderRef = vaResponse.data.data.order_ref;
    } catch (error) {
      console.error('Virtual account creation error:', error);
      return NextResponse.json(
        { message: 'Failed to create virtual account' },
        { status: 500 }
      );
    }

    // STEP 4: Create User and Wallet in transaction
    const passwordHash = await hashPassword(password);

    let userId: string;

    try {
      // Create user and wallet in a single transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            fullName,
            email,
            phone,
            passwordHash,
            role: 'CUSTOMER',
            isVerified: true, // Verified via BVN
            isSuspended: false,
            agentApplicationPending: false,
            flwIdentityRef,
          },
        });

        // Create wallet with virtual account
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

      userId = result.user.id;
    } catch (error) {
      console.error('Database creation error:', error);
      return NextResponse.json(
        { message: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // STEP 5: Generate tokens
    const accessToken = generateAccessToken({
      userId,
      email,
      role: 'CUSTOMER',
    });

    // Update refresh token with correct userId
    const refreshTokenFinal = generateRefreshToken({
      userId,
      email,
      role: 'CUSTOMER',
    });

    // Hash and store refresh token
    const refreshTokenHash = hashToken(refreshTokenFinal);
    await prisma.session.create({
      data: {
        userId,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Set HTTP-only cookie with refresh token
    const response = NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: userId,
          fullName,
          email,
          phone,
          role: 'CUSTOMER',
        },
        accessToken,
        wallet: {
          balanceKobo: 0,
          flwAccountNumber,
          flwBankName,
        },
      },
      { status: 201 }
    );

    response.cookies.set('sm_refresh', refreshTokenFinal, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
