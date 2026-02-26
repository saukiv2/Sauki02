import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * GET /api/data-plans
 * Admin: Get all data plans
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const plans = await prisma.dataPlan.findMany({});
    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch data plans' }, { status: 500 });
  }
}

/**
 * PATCH /api/data-plans/:id
 * Admin: Update data plan
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const updated = await prisma.dataPlan.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update data plan' }, { status: 500 });
  }
}

/**
 * DELETE /api/data-plans/:id
 * Admin: Delete data plan
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await prisma.dataPlan.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Data plan deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete data plan' }, { status: 500 });
  }
}
