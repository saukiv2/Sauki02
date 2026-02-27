import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const VALID_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

/**
 * PATCH /api/orders/[id]
 * Admin: Update order status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = requireAuth(request, 'ADMIN');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = params;
    const { status } = await request.json();

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { fullName: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ message: 'Failed to update order' }, { status: 500 });
  }
}

/**
 * DELETE /api/orders/[id]
 * Admin: Delete order
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = requireAuth(request, 'ADMIN');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = params;

    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json({ message: 'Failed to delete order' }, { status: 500 });
  }
}
