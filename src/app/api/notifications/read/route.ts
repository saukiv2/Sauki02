import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const markReadSchema = z.object({
  notificationIds: z.array(z.string()).optional(),
  markAll: z.boolean().optional(),
});

/**
 * PATCH /api/notifications/read
 * Mark notifications as read
 *
 * Request body options:
 * { notificationIds: ["id1", "id2"] }  - Mark specific notifications
 * { markAll: true }                     - Mark all notifications as read
 */
export async function PATCH(request: NextRequest) {
  try {
    // Get user from middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationIds, markAll } = markReadSchema.parse(body);

    if (markAll) {
      // Mark all user's notifications as read
      const result = await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });

      return NextResponse.json({
        success: true,
        message: `Marked ${result.count} notifications as read`,
        count: result.count,
      });
    }

    if (!notificationIds || notificationIds.length === 0) {
      return NextResponse.json(
        { message: 'Provide notificationIds or markAll: true' },
        { status: 400 }
      );
    }

    // Mark specific notifications as read (verify ownership)
    const result = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId,
      },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      message: `Marked ${result.count} notifications as read`,
      count: result.count,
    });
  } catch (error) {
    console.error('Mark read error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
