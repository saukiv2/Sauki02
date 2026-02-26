import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * GET /api/orders
 * Admin: Get all orders
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const orders = await prisma.order.findMany({
      include: { user: true, items: true },
    });
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 });
  }
}

/**
 * PATCH /api/orders/:id
 * Admin: Update order status
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const updated = await prisma.order.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update order' }, { status: 500 });
  }
}

/**
 * DELETE /api/orders/:id
 * Admin: Delete order
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await prisma.order.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete order' }, { status: 500 });
  }
}
