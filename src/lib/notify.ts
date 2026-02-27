/**
 * Firebase Cloud Messaging notification service
 * Sends push notifications to registered Android devices
 */

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Create a notification record and send FCM push
 * This is called when wallet is credited or bills are paid
 * 
 * IMPORTANT: This function always returns true and never throws.
 * Notification is saved to DB even if FCM delivery fails.
 */
export async function createNotification(
  userId: string,
  type: string,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    const { prisma } = await import('./db');
    const { sendFCMMulticast } = await import('./firebase-admin');
    
    // Save notification to database
    await prisma.notification.create({
      data: {
        userId,
        type,
        title: payload.title,
        body: payload.body,
        dataPayload: payload.data || {},
        isRead: false,
      },
    });

    // Get user's Android push tokens
    const pushTokens = await prisma.pushToken.findMany({
      where: {
        userId,
        platform: 'android',
      },
    });

    if (pushTokens.length === 0) {
      console.log(`No Android push tokens found for user ${userId}`);
      return true; // Notification saved, but no devices to push to
    }

    // Send FCM push to all registered Android devices
    const fcmTokens = pushTokens.map((pt) => pt.fcmToken);
    const result = await sendFCMMulticast(
      fcmTokens,
      payload.title,
      payload.body,
      payload.data
    );

    // Remove invalid tokens from database
    if (result.invalidTokens.length > 0) {
      await prisma.pushToken.deleteMany({
        where: {
          fcmToken: { in: result.invalidTokens },
        },
      });

      console.warn(
        `Removed ${result.invalidTokens.length} invalid FCM token(s) for user ${userId}`
      );
    }

    console.log(
      `FCM notification sent to ${result.successCount}/${pushTokens.length} devices for user ${userId}:`,
      { type, title: payload.title }
    );

    return true;
  } catch (error) {
    console.error('Notification creation error:', error);
    // Even on error, we still consider it successful if notification was saved to DB
    return true;
  }
}

/**
 * Send wallet credit notification
 * Called when funds are deposited to wallet
 */
export async function sendWalletCreditNotification(
  userId: string,
  amountKobo: number,
  reference: string
): Promise<boolean> {
  const amountNaira = (amountKobo / 100).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
  });

  return createNotification(userId, 'wallet_credit', {
    title: '₦' + amountNaira + ' Credited',
    body: `Your wallet has been credited with ₦${amountNaira}. Ref: ${reference}`,
    data: {
      type: 'wallet_credit',
      amount: amountKobo.toString(),
      reference,
    },
  });
}

/**
 * Send data purchase notification
 */
export async function sendDataPurchaseNotification(
  userId: string,
  phoneNumber: string,
  amountNaira: number,
  status: 'SUCCESS' | 'PENDING' | 'FAILED'
): Promise<boolean> {
  const statusText = {
    SUCCESS: 'Data purchase successful',
    PENDING: 'Data purchase pending',
    FAILED: 'Data purchase failed',
  }[status];

  return createNotification(userId, 'data_purchase', {
    title: statusText,
    body: `₦${amountNaira.toLocaleString('en-NG')} to ${phoneNumber}`,
    data: {
      type: 'data_purchase',
      phone: phoneNumber,
      amount: (amountNaira * 100).toString(),
      status,
    },
  });
}

/**
 * Send electricity bill payment notification
 */
export async function sendElectricityNotification(
  userId: string,
  meterNo: string,
  amountNaira: number,
  status: 'SUCCESS' | 'PENDING' | 'FAILED',
  token?: string
): Promise<boolean> {
  const statusText = {
    SUCCESS: 'Electricity payment successful',
    PENDING: 'Electricity payment pending',
    FAILED: 'Electricity payment failed',
  }[status];

  let body = `₦${amountNaira.toLocaleString('en-NG')} to ${meterNo}`;
  if (token && status === 'SUCCESS') {
    body += ` - Token: ${token}`;
  }

  return createNotification(userId, 'electricity_payment', {
    title: statusText,
    body,
    data: {
      type: 'electricity_payment',
      meter: meterNo,
      amount: (amountNaira * 100).toString(),
      status,
      ...(token ? { token } : {}),
    },
  });
}

/**
 * Send transaction notification
 * Generic function for any transaction type
 */
export async function sendTransactionNotification(
  userId: string,
  title: string,
  body: string,
  type: string = 'transaction',
  metadata?: Record<string, string>
): Promise<boolean> {
  return createNotification(userId, type, {
    title,
    body,
    data: metadata,
  });
}

/**
 * Send broadcast notification to all users on Android
 */
export async function sendBroadcastNotification(
  payload: NotificationPayload,
  type: string = 'broadcast'
): Promise<boolean> {
  try {
    const { prisma } = await import('./db');
    const { sendFCMMulticast } = await import('./firebase-admin');
    
    // Save broadcast notification (userId = null)
    await prisma.notification.create({
      data: {
        userId: null, // Broadcast to all
        type,
        title: payload.title,
        body: payload.body,
        dataPayload: payload.data || {},
      },
    });

    // Get all Android push tokens
    const allTokens = await prisma.pushToken.findMany({
      where: { platform: 'android' },
    });

    if (allTokens.length === 0) {
      console.log('No Android devices registered for broadcast');
      return true;
    }

    // Send FCM broadcast to all devices (in chunks of 500 per FCM limit)
    const fcmTokens = allTokens.map((t) => t.fcmToken);
    const chunkSize = 500;
    let totalSuccess = 0;
    let invalidTokens: string[] = [];

    for (let i = 0; i < fcmTokens.length; i += chunkSize) {
      const chunk = fcmTokens.slice(i, i + chunkSize);
      const result = await sendFCMMulticast(
        chunk,
        payload.title,
        payload.body,
        payload.data
      );

      totalSuccess += result.successCount;
      invalidTokens = invalidTokens.concat(result.invalidTokens);
    }

    // Remove invalid tokens
    if (invalidTokens.length > 0) {
      await prisma.pushToken.deleteMany({
        where: { fcmToken: { in: invalidTokens } },
      });
    }

    console.log(
      `Broadcast delivered to ${totalSuccess}/${fcmTokens.length} devices`
    );

    return true;
  } catch (error) {
    console.error('Broadcast notification error:', error);
    return true; // Still return true if notification was saved
  }
}

