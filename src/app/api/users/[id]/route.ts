import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * PATCH /api/users/[id]
 * Admin: Update user role or suspension status
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
    if (body.isSuspended !== undefined) data.isSuspended = Boolean(body.isSuspended);
    if (body.role !== undefined) data.role = body.role;
    if (body.fullName !== undefined) data.fullName = body.fullName.trim();

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        isSuspended: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
  }
}

/**
 * DELETE /api/users/[id]
 * Admin: Delete user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = requireAuth(request, 'ADMIN');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = params;

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 });
  }
}
