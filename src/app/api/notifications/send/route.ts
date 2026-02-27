import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * POST /api/notifications/send
 * Admin: Send notification to specific user or broadcast to all users
 * 
 * Body:
 * {
 *   userId?: string,          // Optional: send to this user. Omit for broadcast
 *   title: string,
 *   body: string,
 *   type: string,             // e.g., 'order', 'payment', 'system'
 *   dataPayload?: object       // Optional metadata
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request, 'ADMIN');
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();
    const { userId, title, body: messageBody, type, dataPayload } = body;

    if (!title?.trim() || !messageBody?.trim() || !type?.trim()) {
      return NextResponse.json(
        { message: 'Missing required fields: title, body, type' },
        { status: 400 }
      );
    }

    let notifications;

    if (userId) {
      // Send to specific user
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }

      notifications = await prisma.notification.create({
        data: {
          userId,
          title: title.trim(),
          body: messageBody.trim(),
          type: type.trim(),
          dataPayload: dataPayload || null,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Notification sent to user',
        data: notifications,
      });
    } else {
      // Broadcast: send to all users
      const allUsers = await prisma.user.findMany({
        select: { id: true },
      });

      if (allUsers.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'Notification prepared but no users to send to',
          data: { count: 0 },
        });
      }

      notifications = await prisma.notification.createMany({
        data: allUsers.map((user) => ({
          userId: user.id,
          title: title.trim(),
          body: messageBody.trim(),
          type: type.trim(),
          dataPayload: dataPayload || null,
        })),
      });

      return NextResponse.json({
        success: true,
        message: `Broadcast notification sent to ${notifications.count} users`,
        data: { count: notifications.count },
      });
    }
  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      { message: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
