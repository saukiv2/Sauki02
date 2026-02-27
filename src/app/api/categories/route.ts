import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * GET /api/categories
 * Admin: Get all categories
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request, 'ADMIN');
    if (authResult instanceof NextResponse) return authResult;

    const categories = await prisma.category.findMany();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({ message: 'Failed to fetch categories' }, { status: 500 });
  }
}

/**
 * POST /api/categories
 * Admin: Create category
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request, 'ADMIN');
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();
    const category = await prisma.category.create({ data: body });
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ message: 'Failed to create category' }, { status: 500 });
  }
}

