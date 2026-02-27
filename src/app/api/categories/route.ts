import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const { requireAuth } = await import('@/lib/api-auth');
    const { prisma } = await import('@/lib/db');

    const authResult = requireAuth(request, 'ADMIN');
    if (authResult instanceof NextResponse) return authResult;

    const categories = await prisma.category.findMany();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { requireAuth } = await import('@/lib/api-auth');
    const { prisma } = await import('@/lib/db');

    const authResult = requireAuth(request, 'ADMIN');
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();
    const category = await prisma.category.create({ data: body });
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create' }, { status: 500 });
  }
}

