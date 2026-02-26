import admin from 'firebase-admin';

/**
 * Firebase Admin SDK initialization
 * Used to send push notifications to Android devices via FCM
 */

let adminApp: admin.app.App | null = null;

/**
 * Initialize Firebase Admin SDK
 * Called lazily on first use
 */
function initializeFirebase(): admin.app.App {
  if (adminApp) {
    return adminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    throw new Error(
      'Firebase credentials not found. Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL'
    );
  }

  adminApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      privateKey: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
      clientEmail,
    }),
    projectId,
  });

  return adminApp;
}

/**
 * Get Firebase Admin messaging instance
 */
export function getAdminMessaging(): admin.messaging.Messaging {
  const app = initializeFirebase();
  return admin.messaging(app);
}

/**
 * Send FCM push notification to a single device
 * @param token Device FCM token
 * @param title Notification title
 * @param body Notification body
 * @param data Additional data payload
 * @returns true if sent successfully, false on error
 */
export async function sendFCMPush(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  try {
    const messaging = getAdminMessaging();

    await messaging.send({
      token,
      notification: {
        title,
        body,
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'saukimart_notifications',
        },
      },
      data,
    });

    return true;
  } catch (error: any) {
    // Handle specific FCM errors
    if (
      error.code === 'messaging/invalid-registration-token' ||
      error.code === 'messaging/registration-token-not-registered'
    ) {
      console.warn(`Invalid FCM token: ${token}`);
      return false; // Token is invalid, should be removed
    }

    console.error(`FCM send error for token ${token}:`, error.message);
    return false;
  }
}

/**
 * Send multicast FCM notification to multiple devices
 * @param tokens Array of device FCM tokens
 * @param title Notification title
 * @param body Notification body
 * @param data Additional data payload
 * @returns Object with successful count, failed count, and invalid tokens
 */
export async function sendFCMMulticast(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
}> {
  try {
    const messaging = getAdminMessaging();

    // Firebase SDK uses sendAll with message list
    const messages = tokens.map((token) => ({
      token,
      notification: { title, body },
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'saukimart_notifications',
        },
      },
      data,
    }));

    const response = await (messaging as any).sendAll(messages, false);

    const invalidTokens: string[] = [];

    response.responses.forEach(
      (resp: any, index: number) => {
        if (!resp.success) {
          const error = resp.error as any;
          if (
            error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered'
          ) {
            const token = tokens[index];
            if (token) {
              invalidTokens.push(token);
            }
          }
        }
      }
    );

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      invalidTokens,
    };
  } catch (error) {
    console.error('FCM multicast error:', error);
    return {
      successCount: 0,
      failureCount: tokens.length,
      invalidTokens: [],
    };
  }
}
