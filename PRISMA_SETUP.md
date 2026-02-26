# Prisma Database Setup Guide

## Overview

The SaukiMart platform uses Prisma ORM with PostgreSQL. The database schema includes **18 models** covering:
- User authentication & roles (CUSTOMER, AGENT, ADMIN)
- Wallet management with transaction history
- Data purchases (Amigo API, custom providers)
- Electricity bill payments (Interswitch)
- E-commerce (products, orders, categories)
- Push notifications & tokens
- Audit logging for admin actions

All monetary values are stored as **integers in kobo** (1 naira = 100 kobo).

## Environment Setup

### 1. Configure DATABASE_URL

Edit `.env.local` and add your PostgreSQL connection string:

```bash
# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/saukimart"

# PostgreSQL from Docker
DATABASE_URL="postgresql://postgres:password@db:5432/saukimart"

# Cloud PostgreSQL (Neon, Render, Railway, etc.)
DATABASE_URL="postgresql://user:password@region.provider.com/saukimart"
```

### 2. Initialize Database

```bash
# Create database migrations
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate
```

### 3. Seed Initial Data

Seeds the admin user and platform settings:

```bash
npm run prisma:seed
```

**Default Admin Credentials:**
- Email: `admin@saukimart.online`
- Password: `Admin@SaukiMart2026`
- Role: `ADMIN`

## Database Models (18 Total)

### 1. **User** — Authentication & Profile
```prisma
- id (cuid)
- fullName
- email (unique)
- phone (unique)
- passwordHash (bcryptjs, saltRounds=12)
- role (CUSTOMER | AGENT | ADMIN)
- isVerified (kyc status)
- isSuspended
- agentApplicationPending
- flwIdentityRef (Flutterwave BVN token - never store raw BVN)
- timestamps
```

### 2. **Session** — Login Sessions
```prisma
- id (cuid)
- userId (FK → User)
- tokenHash (JWT hash for security)
- deviceInfo (optional)
- expiresAt
```

### 3. **Wallet** — User Wallet Account
```prisma
- id (cuid)
- userId (FK unique → User)
- balanceKobo (Int, default 0)
- currency (default "NGN")
- flwAccountNumber (Flutterwave virtual account)
- flwBankName (e.g., "Wema Bank")
- flwOrderRef (Flutterwave order reference)
- timestamps
```

### 4. **WalletTransaction** — Transaction History
```prisma
- id (cuid)
- walletId (FK → Wallet)
- type (CREDIT | DEBIT | TRANSFER_IN | TRANSFER_OUT | REFUND)
- amountKobo
- balanceBefore & balanceAfter
- ref (unique transaction reference)
- description
- metadata (JSON for extra data)
- status (PENDING | SUCCESS | FAILED)
- Index: [walletId, createdAt]
```

### 5. **WalletTransfer** — P2P Transfers
```prisma
- id (cuid)
- senderWalletId (FK)
- recipientWalletId (FK)
- amountKobo
- note (optional)
```

### 6. **FlutterwaveDeposit** — Webhook Receipts
```prisma
- id (cuid)
- walletId (FK → Wallet)
- flwRef (unique from webhook)
- flwTxId
- amountKobo
- originatorName, originatorAccount, bankName
- status (PENDING | SUCCESS | FAILED)
- webhookReceivedAt
```

### 7. **CustomDataApi** — Multi-Provider Data API Config
```prisma
- id (cuid)
- name (provider name)
- baseUrl
- authHeader
- requestBodyTemplate (JSON with {{phone}}, {{planCode}}, etc.)
- isActive
- timestamps
```

### 8. **DataPlan** — Mobile Data Plans
```prisma
- id (cuid)
- name
- network (MTN | Airtel | Glo | 9Mobile)
- size (e.g., "1GB")
- validity (days)
- dataType (SME | Corporate | Gifting)
- apiProvider (AMIGO | CUSTOM_1 | CUSTOM_2 | CUSTOM_3)
- amigoNetworkId (1=MTN, 2=Glo, 4=Airtel)
- amigoPlanId
- customApiId & customApiCode
- customerPriceKobo, agentPriceKobo, costPriceKobo (profit: customer - cost)
- isActive
```

### 9. **DataPurchase** — Data Purchase Records
```prisma
- id (cuid)
- userId (FK)
- planId (FK)
- phoneNumber
- amountKobo
- apiProvider
- providerResponse (JSON)
- amigoReference
- status (PENDING | SUCCESS | FAILED)
- walletTxId
- Index: [userId, createdAt]
```

### 10. **ElectricityPurchase** — Bill Payment Records
```prisma
- id (cuid)
- userId (FK)
- disco (distribution company)
- iswBillerId (Interswitch ID)
- iswPaymentCode
- meterNo
- customerName
- amountKobo
- serviceChargeKobo
- units, token (from Interswitch)
- iswRequestRef, iswResponseCode
- status (PENDING | SUCCESS | FAILED)
- walletTxId
- Index: [userId, createdAt]
```

### 11. **Category** — Product Categories
```prisma
- id (cuid)
- name
- icon (emoji or URL)
- displayOrder
```

### 12. **Product** — E-Commerce Products
```prisma
- id (cuid)
- name
- categoryId (FK)
- description
- specs (JSON)
- images (String[] of paths like "/uploads/products/uuid.webp")
- customerPriceKobo, agentPriceKobo
- stockQty
- isActive
```

### 13. **Order** — Customer Orders
```prisma
- id (cuid)
- userId (FK)
- status (PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED | REFUNDED)
- totalKobo
- deliveryAddress (JSON)
- walletTxId
- timestamps
- Index: [userId, status]
```

### 14. **OrderItem** — Order Line Items
```prisma
- id (cuid)
- orderId (FK)
- productId (FK)
- qty
- unitPriceKobo
- subtotalKobo
```

### 15. **Notification** — Push Notifications
```prisma
- id (cuid)
- userId (nullable - null for broadcast)
- type (string)
- title, body
- dataPayload (JSON)
- isRead (default false)
- sentAt (default now())
- Index: [userId, isRead]
```

### 16. **PushToken** — FCM Tokens
```prisma
- id (cuid)
- userId (FK)
- fcmToken
- platform (default "android")
- lastSeen (default now())
- Unique: [userId, fcmToken]
```

### 17. **PlatformSetting** — Configuration Key-Value Store
Pre-seeded rows:
```
electricity_customer_charge_kobo = "10000"
electricity_agent_charge_kobo = "5000"
agent_applications_open = "true"
maintenance_mode = "false"
platform_name = "SaukiMart"
```

### 18. **AuditLog** — Admin Action Audit Trail
```prisma
- id (cuid)
- adminId (string reference to User.id)
- action
- targetType, targetId
- metadata (JSON)
- createdAt
```

## Key Indexes

Performance-optimized indexes:
```prisma
WalletTransaction: [walletId, createdAt]
DataPurchase: [userId, createdAt]
ElectricityPurchase: [userId, createdAt]
Order: [userId, status]
Notification: [userId, isRead]
User: [email], [phone], [role]
```

## Prisma Client Usage

### Import in Components/API

```typescript
import { prisma } from '@/lib/db';

// Query
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: { wallet: true, orders: true }
});

// Create
const newOrder = await prisma.order.create({
  data: {
    userId: 'user-id',
    status: 'PENDING',
    totalKobo: 50000,
    deliveryAddress: { street: '123 Main St', city: 'Lagos' }
  }
});

// Update
await prisma.wallet.update({
  where: { userId: 'user-id' },
  data: { balanceKobo: { increment: 10000 } }
});

// Transaction
await prisma.$transaction([
  prisma.wallet.update({ where: { userId: 'buyer' }, data: { balanceKobo: { decrement: 50000 } } }),
  prisma.wallet.update({ where: { userId: 'seller' }, data: { balanceKobo: { increment: 50000 } } })
]);
```

## Migrations

### Create Migration After Schema Changes

```bash
npm run prisma:migrate
```

This creates a migration file in `prisma/migrations/` that tracks all database changes.

### View Database

```bash
npx prisma studio
```

Opens a GUI to browse and edit database records.

## Security Best Practices

1. **Never store raw BVN** — Use `flwIdentityRef` (Flutterwave token) only
2. **Hash passwords** — bcryptjs with saltRounds=12 (done in seed.ts)
3. **JWT tokens** — Store as hash in Session.tokenHash
4. **Audit logging** — All admin actions logged in AuditLog
5. **Status tracking** — All monetary transactions tracked via TxStatus

## Connection Pooling

For production, configure connection pooling:

```bash
# Using PgBouncer or Prisma Connection Pool
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
```

Add to `.env.local`:
```
DATABASE_POOL_SIZE=20
DATABASE_STATEMENT_CACHE_SIZE=200
```

## Backup Strategy

```bash
# PostgreSQL backup
pg_dump -U user -h host saukimart > backup.sql

# Restore
psql -U user -h host saukimart < backup.sql
```

## Troubleshooting

### Schema validation errors
```bash
npx prisma format
npm run prisma:generate
```

### Reset database (development only!)
```bash
npx prisma migrate reset
```

### Debug Prisma queries
```bash
# Enable detailed logging
DATABASE_LOG=query npm run dev
```

---

**Next Steps:** Configure payment providers (Flutterwave, Interswitch, Amigo) in `.env.local`
