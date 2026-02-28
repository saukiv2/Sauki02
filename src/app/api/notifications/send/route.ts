import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * POST /api/notifications/send
 * Admin: Send notification to user(s)
 * 
 * Body: { userId?: string, title: string, message: string, broadcastToAll?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/db');
    const { requireAuth } = await import('@/lib/api-auth');
    const { v4: uuidv4 } = await import('uuid');

    const authResult = requireAuth(request, 'ADMIN');
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();
    const { userId, title, message, broadcastToAll } = body;

    if (!title || !message) {
      return NextResponse.json(
        { message: 'Title and message required' },
        { status: 400 }
      );
    }

    // If broadcastToAll, send to all users. Otherwise, send to specific user.
    let targetUserIds: string[] = [];

    if (broadcastToAll) {
      const users = await prisma.user.findMany({
        select: { id: true },
      });
      targetUserIds = users.map(u => u.id);
    } else if (userId) {
      targetUserIds = [userId];
    } else {
      return NextResponse.json(
        { message: 'userId or broadcastToAll required' },
        { status: 400 }
      );
    }

    // Create notifications for all target users
    const notifications = await prisma.notification.createMany({
      data: targetUserIds.map(uid => ({
        id: uuidv4(),
        userId: uid,
        title,
        body: message,
        type: 'ADMIN',
        isRead: false,
        sentAt: new Date(),
      })),
    });

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${targetUserIds.length} user(s)`,
      count: notifications.count,
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      { message: 'Failed to send notification' },
      { status: 500 }
    );
  }
}