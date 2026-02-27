import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/db');
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        category: product.category.name,
        categoryId: product.categoryId,
        description: product.description,
        specs: product.specs,
        images: product.images,
        customerPrice: (product.customerPriceKobo / 100).toFixed(2),
        agentPrice: (product.agentPriceKobo / 100).toFixed(2),
        stock: product.stockQty,
        isActive: product.isActive,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ message: 'Admin required' }, { status: 403 });
    }

    const { prisma } = await import('@/lib/db');
    const body = await request.json();

    const product = await prisma.product.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ message: 'Admin required' }, { status: 403 });
    }

    const { prisma } = await import('@/lib/db');
    await prisma.product.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete' }, { status: 500 });
  }
}
