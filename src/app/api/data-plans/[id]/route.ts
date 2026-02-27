import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * PATCH /api/data-plans/[id]
 * Admin: Update a data plan
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = requireAuth(request, 'ADMIN');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name.trim();
    if (body.network !== undefined) data.network = body.network.trim().toUpperCase();
    if (body.priceKobo !== undefined) data.priceKobo = Number(body.priceKobo);
    if (body.validityDays !== undefined) data.validityDays = Number(body.validityDays);
    if (body.dataGb !== undefined) data.dataGb = Number(body.dataGb);
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    const updated = await prisma.dataPlan.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update data plan error:', error);
    return NextResponse.json({ message: 'Failed to update data plan' }, { status: 500 });
  }
}

/**
 * DELETE /api/data-plans/[id]
 * Admin: Delete a data plan
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = requireAuth(request, 'ADMIN');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = params;

    await prisma.dataPlan.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Data plan deleted' });
  } catch (error) {
    console.error('Delete data plan error:', error);
    return NextResponse.json({ message: 'Failed to delete data plan' }, { status: 500 });
  }
}
