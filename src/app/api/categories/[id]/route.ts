import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * PATCH /api/categories/[id]
 * Admin: Update a category
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = requireAuth(request, 'ADMIN');
    if (authResult instanceof NextResponse) return authResult;

    const { name, icon, displayOrder } = await request.json();
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name.trim();
    if (icon !== undefined) data.icon = icon?.trim() || null;
    if (displayOrder !== undefined) data.displayOrder = Number(displayOrder);

    const updated = await prisma.category.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({ message: 'Failed to update category' }, { status: 500 });
  }
}

/**
 * DELETE /api/categories/[id]
 * Admin: Delete a category (only if it has no products)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = requireAuth(request, 'ADMIN');
    if (authResult instanceof NextResponse) return authResult;

    const productCount = await prisma.product.count({
      where: { categoryId: params.id },
    });
    if (productCount > 0) {
      return NextResponse.json(
        { message: `Cannot delete: category has ${productCount} product(s). Reassign or delete them first.` },
        { status: 409 }
      );
    }
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete category' }, { status: 500 });
  }
}
