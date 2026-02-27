import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('sm_refresh')?.value;

    if (refreshToken) {
      const { hashToken } = await import('@/lib/auth');
      const { prisma } = await import('@/lib/db');
      const tokenHash = hashToken(refreshToken);
      await prisma.session.deleteMany({ where: { tokenHash } });
    }

    const response = NextResponse.json({ message: 'Logout successful' });
    response.cookies.delete('sm_access');
    response.cookies.delete('sm_refresh');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
