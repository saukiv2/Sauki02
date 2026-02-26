## Mobile Data Top-Up API (Amigo Integration)

### Setup Complete ✅

#### Environment Variables

Add to `.env.local`:

```env
# Amigo API credentials
AMIGO_API_TOKEN=your-api-token-from-amigo-dashboard
AMIGO_PROXY_URL=https://your-aws-proxy.com/api/data
```

---

## API Endpoints

### 1. Get Available Data Plans

```
GET /api/data/plans?network=MTN&userType=CUSTOMER
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `network` (optional): Filter by network (MTN, GLO, AIRTEL)
- `userType` (optional): CUSTOMER (default) or AGENT (for discounted pricing)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxx...",
      "name": "MTN 1GB",
      "network": "MTN",
      "size": "1GB",
      "validity": "30 days",
      "type": "SME",
      "provider": "AMIGO",
      "price": 70000,
      "priceNaira": "700.00",
      "costPrice": 60000,
      "margin": 10000
    }
  ],
  "count": 12
}
```

---

### 2. Purchase Mobile Data

```
POST /api/data/purchase
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "planId": "clxx...",
  "phoneNumber": "09012345678"
}
```

**Phone Number Format:**
- Nigerian format: 070, 080, 081, 090, 091 followed by 8 digits
- Total: 11 digits (including leading 0)
- Can accept: 09012345678 or +2349012345678 or 2349012345678
- Automatically converted to standard format (09012345678)

**Response - Success (HTTP 200):**
```json
{
  "success": true,
  "message": "Data purchase successful",
  "reference": "AMG-REF-123456",
  "amount": 700,
  "phone": "09012345678",
  "plan": "MTN 1GB",
  "provider": {
    "success": true,
    "reference": "AMG-REF-123456",
    "message": "Data delivered successfully",
    "amount_charged": 700,
    "status": "delivered"
  }
}
```

**Response - Insufficient Balance (HTTP 402):**
```json
{
  "message": "Insufficient wallet balance",
  "available": 50000,
  "required": 70000
}
```

**Response - Failure (HTTP 400):**
```json
{
  "success": false,
  "message": "Data purchase failed - wallet has been refunded",
  "error": "Provider error details",
  "reference": "clxx..." (purchase ID for support)
}
```

---

### 3. Get Data Purchase History

```
GET /api/data/history?page=1&limit=20&status=SUCCESS
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `status` (optional): PENDING, SUCCESS, or FAILED

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxx...",
      "plan": "MTN 1GB",
      "network": "MTN",
      "size": "1GB",
      "validity": "30 days",
      "phone": "09012345678",
      "amount": "700.00",
      "amountKobo": 70000,
      "status": "SUCCESS",
      "reference": "AMG-REF-123456",
      "provider": "AMIGO",
      "date": "2026-02-26T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### 4. Seed Data Plans (Development Only)

```
POST /api/data/seed
Authorization: Bearer {accessToken}
x-user-role: ADMIN
```

Creates 10 sample data plans for testing:
- **MTN:** 100MB, 500MB, 1GB, 2GB
- **GLO:** 100MB, 500MB, 1GB
- **AIRTEL:** 100MB, 500MB, 1GB

Available only in development environment.

---

## Amigo API Integration Details

### Request Flow

```
Client HTTP Request
    ↓
Next.js API Route (/api/data/purchase)
    ↓ (deduct wallet immediately)
Wallet Deducted
    ↓
AWS Proxy (AWS_PROXY_URL)
    ↓ (rate limiting, fraud detection)
Amigo API (https://amigo.ng/api/data/)
    ↓
Response Processing
    ↓ (success: update to SUCCESS, failure: refund)
Final State
```

### Amigo Request Format

```typescript
{
  network: 1 | 2 | 4,           // 1=MTN, 2=GLO, 4=AIRTEL
  mobile_number: "09012345678",  // Recipient phone
  plan: "1001",                  // Plan ID
  Ported_number: true            // Always true for Nigerian numbers
}
```

### Network Codes

| Network | Code |
|---------|------|
| MTN     | 1    |
| GLO     | 2    |
| AIRTEL  | 4    |

### Headers Required

```
X-API-Key: {AMIGO_TOKEN}
Idempotency-Key: {uuid}        # Prevents duplicate charges on retry
Content-Type: application/json
```

### Amigo Success Response

```json
{
  "success": true,
  "reference": "AMG-2026022600001",
  "message": "Data delivered successfully",
  "amount_charged": 700,
  "status": "delivered"
}
```

---

## Wallet Transaction Flow

### On Purchase Request

1. ✅ Deduct amount from wallet immediately (PENDING status)
2. ✅ Create debit WalletTransaction
3. ✅ Call Amigo API

### On Success

4. ✅ Update DataPurchase to SUCCESS
5. ✅ Update WalletTransaction to SUCCESS
6. ✅ Send "Data purchase successful" FCM notification
7. ✅ Log transaction reference

### On Failure

8. ✅ Revert wallet balance (refund)
9. ✅ Create REFUND transaction
10. ✅ Update DataPurchase to FAILED
11. ✅ Send "Data purchase failed" FCM notification
12. ✅ Return error code 400

**Wallet is always in correct state:** 
- Success: balance reduced by purchase amount
- Failure: balance restored (user refunded)

---

## Database Schema

### DataPlan Model

```typescript
model DataPlan {
  id                String        @id @default(cuid())
  name              String        // e.g., "MTN 1GB"
  network           String        // MTN, GLO, AIRTEL
  size              String        // 100MB, 1GB, 2GB
  validity          Int           // Days (1-365)
  dataType          String        // SME, Corporate
  apiProvider       String        // AMIGO, CUSTOM
  amigoNetworkId    Int?          // Network code for Amigo
  amigoPlanId       Int?          // Plan ID for Amigo API
  customApiId       String?       // For custom providers
  customApiCode     String?       // Provider-specific code
  customerPriceKobo Int           // Customer price (in kobo)
  agentPriceKobo    Int           // Agent discount price
  costPriceKobo     Int           // Cost to platform
  isActive          Boolean       @default(true)
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}
```

### DataPurchase Model

```typescript
model DataPurchase {
  id                String      @id @default(cuid())
  userId            String      // Who purchased
  planId            String      // Which plan
  phoneNumber       String      // Recipient number
  amountKobo        Int         // Amount charged (in kobo)
  apiProvider       String      // AMIGO or CUSTOM
  providerResponse  Json?       // Full API response
  amigoReference    String?     // Unique reference from Amigo
  status            TxStatus    // PENDING, SUCCESS, FAILED
  walletTxId        String?     // Link to wallet transaction
  createdAt         DateTime    @default(now())
}
```

---

## Error Handling

### Validation Errors

```typescript
// Invalid plan
{ "message": "Data plan not found or unavailable", status: 404 }

// Invalid phone
{ "message": "Invalid phone number format", status: 400 }

// Missing fields
{ "message": "Validation error", errors: [...], status: 400 }
```

### Processing Errors

```typescript
// Insufficient balance (user prompted to add funds)
{ "message": "Insufficient wallet balance", 
  "available": 50000, "required": 70000, status: 402 }

// API timeout or network error
{ "message": "Data purchase failed - wallet has been refunded", status: 400 }
```

### Automatic Refunds

- Wallet automatically refunded if purchase fails
- User sees notification of failure + refund
- Purchase record marked as FAILED for troubleshooting
- Support can reference DataPurchase.id

---

## Testing Guide

### 1. Setup Test Data

```bash
# Create admin user with auth endpoint
# Then:
curl -X POST http://localhost:3000/api/data/seed \
  -H "Authorization: Bearer {admin_token}" \
  -H "x-user-role: ADMIN"
```

### 2. List Available Plans

```bash
curl -X GET "http://localhost:3000/api/data/plans?network=MTN" \
  -H "Authorization: Bearer {customer_token}"
```

### 3. Purchase Data

```bash
curl -X POST http://localhost:3000/api/data/purchase \
  -H "Authorization: Bearer {customer_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "clxx...",
    "phoneNumber": "09012345678"
  }'
```

### 4. Check History

```bash
curl -X GET "http://localhost:3000/api/data/history?page=1&limit=10&status=SUCCESS" \
  -H "Authorization: Bearer {customer_token}"
```

---

## Production Checklist

- [ ] Set AMIGO_TOKEN in production environment
- [ ] Set AWS_PROXY_URL to production proxy
- [ ] Update data plans with real Amigo plan IDs
- [ ] Configure wallet address verification (optional)
- [ ] Monitor data purchase failure rate
- [ ] Set up alerts for API errors
- [ ] Test refund flow before launch
- [ ] Verify phone number validation for your target regions
- [ ] Enable audit logging for transactions

---

## Future Extensions

### Support Multiple Data Providers

```typescript
// In DataPlan, set apiProvider to "CUSTOM"
// Then use customApiId and customApiCode for routing
// Custom module at: /src/lib/data-providers/{providerName}.ts
```

### Network-Specific Pricing

```typescript
// Already supported in schema:
// - Different customer vs agent pricing
// - Different cost prices for margin analysis
// - Can add time-based pricing later
```

### Bulk Data Purchases

```typescript
// Future: POST /api/data/bulk-purchase
// { orders: [{ planId, phoneNumber }] }
// Single wallet deduction, batch API calls
```

