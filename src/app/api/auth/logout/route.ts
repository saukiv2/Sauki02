import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('sm_refresh')?.value;

    if (refreshToken) {
      // Hash and delete the session
      const tokenHash = hashToken(refreshToken);
      await prisma.session.deleteMany({
        where: { tokenHash },
      });
    }

    // Clear cookies
    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );

    response.cookies.delete('sm_refresh');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
