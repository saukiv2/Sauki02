## Firebase Push Notification & Webhook Integration

### Setup Complete ✅

#### Firebase Configuration

Add the following environment variables to `.env.local`:

```env
# Firebase Admin SDK credentials
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Flutterwave webhook
FLW_WEBHOOK_HASH=your-flutterwave-webhook-hash
```

**How to get Firebase credentials:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Copy the values from the JSON file:
   - `project_id` → FIREBASE_PROJECT_ID
   - `private_key` → FIREBASE_PRIVATE_KEY (keep the \n characters)
   - `client_email` → FIREBASE_CLIENT_EMAIL

---

## Implementation Details

### 1. Firebase Admin SDK (`/src/lib/firebase-admin.ts`)

Provides two core functions:

#### `sendFCMPush(token, title, body, data?)`
- Sends notification to a single Android device
- Returns true on success, false on error
- Automatically handles invalid token detection

#### `sendFCMMulticast(tokens[], title, body, data?)`
- Sends notification to multiple Android devices at once
- Returns: `{ successCount, failureCount, invalidTokens }`
- Automatically removes invalid tokens from database

**Features:**
- Lazy initialization (Firebase Admin SDK only loaded when needed)
- Automatic credential handling from environment variables
- Error handling for expired/invalid tokens
- High priority Android notifications

### 2. Notification Service (`/src/lib/notify.ts`)

Central notification manager with **guaranteed delivery**:

#### `createNotification(userId, type, payload)`
- **Always returns true** and **never throws**
- Saves notification to database first
- Queries user's Android push tokens (platform: 'android')
- Sends FCM push to each device
- Removes invalid tokens silently
- Even if FCM fails, notification is safely stored in DB

Notification payload:
```typescript
interface NotificationPayload {
  title: string;        // e.g., "₦5,000 Credited"
  body: string;         // e.g., "Your wallet has been credited..."
  data?: {              // Optional metadata
    [key]: string
  }
}
```

#### Pre-built Functions:
- `sendWalletCreditNotification(userId, amountKobo, reference)`
- `sendDataPurchaseNotification(userId, phone, amountNaira, status)`
- `sendElectricityNotification(userId, meterNo, amountNaira, status, token?)`
- `sendBroadcastNotification(payload, type)` - To all Android users

### 3. Flutterwave Webhook (`/src/app/api/wallet/webhook/route.ts`)

**Endpoint:** `POST /api/wallet/webhook`

**Security:**
- Signature verification using HMAC-SHA256
- Header: `verif-hash` (from FLW_WEBHOOK_HASH env)
- Public route (no authentication required)

**Event Handling:**
```
Event: charge.completed
Status: successful
```

**Webhook Flow:**
1. ✅ Verify HMAC-SHA256 signature
2. ✅ Parse webhook event
3. ✅ Look up wallet by flwOrderRef
4. ✅ Create FlutterwaveDeposit record
5. ✅ Credit wallet balance (store as kobo)
6. ✅ Create WalletTransaction record
7. ✅ Call `sendWalletCreditNotification()` → triggers FCM
8. ✅ Return 200 status

**Field Mapping:**
```typescript
// Webhook JSON → Database
data.tx_ref              → FlutterwaveDeposit.flwRef
data.id                  → FlutterwaveDeposit.flwTxId
data.amount * 100        → FlutterwaveDeposit.amountKobo
data.meta_data.originatorname          → FlutterwaveDeposit.originatorName
data.meta_data.originatoraccountnumber → FlutterwaveDeposit.originatorAccount
data.meta_data.bankname                → FlutterwaveDeposit.bankName
```

---

## Database Schema Integration

### PushToken table
```typescript
model PushToken {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fcmToken  String   @unique
  platform  String   // 'android', 'ios', 'web'
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Notification table
```typescript
model Notification {
  id          String   @id @default(cuid())
  userId      String?  // null for broadcasts
  user        User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  type        String   // 'wallet_credit', 'data_purchase', etc.
  title       String
  body        String
  dataPayload Json     @default("{}")
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

---

## Android Integration

### Register FCM Token (Client-side)

Users must register their FCM token when launching the app:

```typescript
// POST /api/token/register
// Headers: Authorization: Bearer {accessToken}
{
  "fcmToken": "eahxxx...",
  "platform": "android"
}
```

**When to register:**
- On app first launch
- Periodically (FCM tokens can be refreshed)
- After user logs in

### Notification Reception

When wallet is credited:
1. Webhook fires → `sendWalletCreditNotification()` called
2. Firebase sends FCM to Android device
3. Notification appears in Android notification tray
4. User taps notification → App opens with transaction details

**Expected notification:**
- Title: "₦5,000.00 Credited"
- Body: "Your wallet has been credited with ₦5,000.00. Ref: FLW-REF-123"
- Channel: `saukimart_notifications`

---

## Error Handling

### Graceful Degradation
- If Firebase credentials missing → error logged, app continues
- If FCM token invalid → token removed from DB, notification saved
- If notification service fails → error logged, notification still in DB
- Webhook returns 200 always (even on success, to prevent retries)

### Invalid Token Cleanup
```typescript
// Automatic cleanup when tokens expire
await prisma.pushToken.deleteMany({
  where: { fcmToken: { in: invalidTokens } }
});
```

---

## Testing Webhook Locally

Use tools like Postman or curl to test webhook:

```bash
curl -X POST http://localhost:3000/api/wallet/webhook \
  -H "Content-Type: application/json" \
  -H "verif-hash: $(echo -n '{body}' | openssl dgst -sha256 -hmac 'YOUR_WEBHOOK_HASH' -binary | base64)" \
  -d '{
    "event": "charge.completed",
    "data": {
      "id": "12345",
      "tx_ref": "ref-123",
      "amount": "50",
      "status": "successful",
      "meta_data": {
        "originatorname": "John Doe",
        "originatoraccountnumber": "1234567890",
        "bankname": "Access Bank"
      }
    }
  }'
```

---

## Production Checklist

- [ ] Set Firebase credentials in production environment
- [ ] Set FLW_WEBHOOK_HASH in production environment
- [ ] Configure Flutterwave webhook URL to production domain
- [ ] Test webhook signature verification
- [ ] Monitor FCM delivery rates in Firebase Console
- [ ] Set up alerts for webhook failures
- [ ] Enable Firebase Anonymous Analytics (optional)
- [ ] Implement token refresh logic in Android app

