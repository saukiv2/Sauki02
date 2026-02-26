import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * GET /api/users
 * Admin: Get all users
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const users = await prisma.user.findMany({});
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}

/**
 * PATCH /api/users/:id
 * Admin: Update user info
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const updated = await prisma.user.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
  }
}

/**
 * DELETE /api/users/:id
 * Admin: Delete user
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 });
  }
}
