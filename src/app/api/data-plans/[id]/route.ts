import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { requireAuth } = await import('@/lib/api-auth');
    const { prisma } = await import('@/lib/db');

    const authResult = requireAuth(request, 'ADMIN');
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name.trim();
    if (body.network !== undefined) data.network = body.network.trim().toUpperCase();
    if (body.priceKobo !== undefined) data.priceKobo = Number(body.priceKobo);
    if (body.validityDays !== undefined) data.validityDays = Number(body.validityDays);
    if (body.dataGb !== undefined) data.dataGb = Number(body.dataGb);
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    const updated = await prisma.dataPlan.update({ where: { id: params.id }, data });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { requireAuth } = await import('@/lib/api-auth');
    const { prisma } = await import('@/lib/db');

    const authResult = requireAuth(request, 'ADMIN');
    if (authResult instanceof NextResponse) return authResult;

    await prisma.dataPlan.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete' }, { status: 500 });
  }
}
