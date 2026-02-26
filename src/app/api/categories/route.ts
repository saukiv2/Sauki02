import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * GET /api/categories
 * Admin: Get all categories
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const categories = await prisma.category.findMany({});
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch categories' }, { status: 500 });
  }
}

/**
 * PATCH /api/categories/:id
 * Admin: Update category
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const updated = await prisma.category.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update category' }, { status: 500 });
  }
}

/**
 * DELETE /api/categories/:id
 * Admin: Delete category
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete category' }, { status: 500 });
  }
}
