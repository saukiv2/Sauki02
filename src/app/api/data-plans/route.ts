import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * GET /api/data-plans
 * Admin: Get all data plans
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request, 'ADMIN');
    if (authResult instanceof NextResponse) return authResult;

    const plans = await prisma.dataPlan.findMany({ orderBy: { network: 'asc' } });
    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    console.error('Get data plans error:', error);
    return NextResponse.json({ message: 'Failed to fetch data plans' }, { status: 500 });
  }
}

/**
 * POST /api/data-plans
 * Admin: Create data plan
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request, 'ADMIN');
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();
    const plan = await prisma.dataPlan.create({ data: body });
    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    console.error('Create data plan error:', error);
    return NextResponse.json({ message: 'Failed to create data plan' }, { status: 500 });
  }
}

