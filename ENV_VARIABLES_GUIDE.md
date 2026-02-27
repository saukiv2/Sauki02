# SaukiMart - Complete Environment Variables Guide

## 🔐 Required Environment Variables for Production

This document lists all environment variables required for SaukiMart to run in production with all features enabled.

---

## 1. DATABASE CONFIGURATION

### `DATABASE_URL`
**Type:** String  
**Required:** YES (Critical)  
**Purpose:** PostgreSQL connection string for all data persistence

**Format:**
```
postgresql://username:password@host:port/database_name
```

**Examples:**
- Local: `postgresql://localhost:5432/saukimart`
- Vercel Postgres: `postgresql://user@xxxxx.vercel:password@xxxxx.postgres.vercel.com:5432/database`
- Supabase: `postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres`

**Where to get it:**
- Vercel: Vercel Dashboard > Storage > Postgres
- Supabase: Supabase Dashboard > Settings > Database
- AWS RDS: RDS Console > Databases > Endpoint

---

## 2. AUTHENTICATION & SECURITY

### `JWT_SECRET`
**Type:** String (min 32 characters)  
**Required:** YES (Critical)  
**Purpose:** JWT signing key for access tokens (expires in 1 hour)

**Generate:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### `JWT_REFRESH_SECRET`
**Type:** String (min 32 characters)  
**Required:** YES (Critical)  
**Purpose:** JWT signing key for refresh tokens (expires in 30 days)

**Generate:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### `NEXT_PUBLIC_BASE_URL`
**Type:** String  
**Required:** YES (Critical)  
**Purpose:** Application base URL for redirects and API calls

**Examples:**
- Local: `http://localhost:3000`
- Production: `https://saukimart.online`
- Staging: `https://staging.saukimart.online`

---

## 3. PAYMENT GATEWAY - FLUTTERWAVE

### `FLW_PUBLIC_KEY`
**Type:** String  
**Required:** YES (Critical for wallet top-up)  
**Purpose:** Public key for Flutterwave payment initiation

**Where to get it:** https://dashboard.flutterwave.com/settings/apis  
**Format:** `pk_test_xxxxxxxxxxxxx` (test) or `pk_live_xxxxxxxxxxxxx` (production)

---

### `FLW_SECRET_KEY`
**Type:** String  
**Required:** YES (Critical for wallet top-up)  
**Purpose:** Secret key for backend API calls to Flutterwave

**Where to get it:** https://dashboard.flutterwave.com/settings/apis  
**Format:** `sk_test_xxxxxxxxxxxxx` (test) or `sk_live_xxxxxxxxxxxxx` (production)

---

### `FLW_WEBHOOK_HASH`
**Type:** String  
**Required:** YES (Critical for payment verification)  
**Purpose:** Hash for verifying webhook signatures from Flutterwave

**Where to get it:**
1. Go to https://dashboard.flutterwave.com/settings/webhooks
2. Copy the "Secret hash" value
3. Set webhook URL to: `https://your-domain.com/api/wallet/webhook`

---

## 4. DATA PROVIDER - AMIGO (For Data Purchases)

### `AMIGO_API_TOKEN`
**Type:** String  
**Required:** YES (For data vending feature)  
**Purpose:** Authentication token for Amigo Data API

**Where to get it:** https://amigosms.com/documentation

---

### `AMIGO_PROXY_URL`
**Type:** String (URL)  
**Required:** YES (For data vending feature)  
**Purpose:** AWS Lambda proxy for Amigo requests (handles proxying)

**Format:** `https://xxxxxxx.execute-api.region.amazonaws.com/stage/amigo`

**Already configured for test environment**

---

## 5. DATA PROVIDER - INTERSWITCH (Optional)

### `INTERSWITCH_CLIENT_ID`
**Type:** String  
**Required:** NO (Optional for airtime/data)  
**Purpose:** Interswitch authentication

**Where to get it:** https://developer.interswitchng.com/

---

### `INTERSWITCH_CLIENT_SECRET`
**Type:** String  
**Required:** NO (Optional for airtime/data)  
**Purpose:** Interswitch secret authentication

---

### `INTERSWITCH_TERMINAL_ID`
**Type:** String  
**Required:** NO (Optional for airtime/data)  
**Purpose:** Terminal ID assigned by Interswitch

---

### `INTERSWITCH_AUTH_URL`
**Type:** String  
**Required:** NO (Optional)  
**Purpose:** Interswitch API endpoint

**Options:**
- Sandbox: `https://sandbox.interswitchng.com`
- Production: `https://api.interswitchng.com`

---

## 6. FIREBASE (For Push Notifications - Optional)

### `FIREBASE_PROJECT_ID`
**Type:** String  
**Required:** NO (Optional for notifications)  
**Purpose:** Firebase project identifier

**Where to get it:** Firebase Console > Project Settings > General

---

### `FIREBASE_PRIVATE_KEY`
**Type:** String (PEM format)  
**Required:** NO (Optional for notifications)  
**Purpose:** Private key for Firebase Admin SDK

**Where to get it:**
1. Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Copy the `private_key` value from JSON

**Important:** Keep the `\n` characters in properly

---

### `FIREBASE_CLIENT_EMAIL`
**Type:** String  
**Required:** NO (Optional for notifications)  
**Purpose:** Service account email

**Format:** `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`

---

### `NEXT_PUBLIC_FIREBASE_API_KEY`
**Type:** String  
**Required:** NO (Optional)  
**Purpose:** Public Firebase API key (safe to expose)

---

### `NEXT_PUBLIC_FIREBASE_*` (Other Firebase Keys)
**Purpose:** Frontend Firebase configuration  
**Required:** NO (Optional)  
**Get from:** Firebase Console > Project Settings > Your Apps

---

## 7. ENVIRONMENT FLAGS

### `NODE_ENV`
**Type:** String  
**Required:** YES  
**Purpose:** Node.js environment mode

**Options:**
- `development`: Local development
- `production`: Vercel/production deployment

---

### `NEXT_PUBLIC_ENVIRONMENT`
**Type:** String  
**Required:** YES  
**Purpose:** Public environment indicator (visible to frontend)

**Options:**
- `development`
- `staging`
- `production`

---

## 📋 COMPLETE CHECKLIST FOR PRODUCTION DEPLOYMENT

### Essential (❌ App won't work without these):
- ✅ `DATABASE_URL` - PostgreSQL connection
- ✅ `JWT_SECRET` - Access token signing
- ✅ `JWT_REFRESH_SECRET` - Refresh token signing
- ✅ `NEXT_PUBLIC_BASE_URL` - Application URL
- ✅ `FLW_PUBLIC_KEY` - Flutterwave public key
- ✅ `FLW_SECRET_KEY` - Flutterwave secret key
- ✅ `FLW_WEBHOOK_HASH` - Payment webhook verification
- ✅ `AMIGO_API_TOKEN` - Data purchases
- ✅ `AMIGO_PROXY_URL` - Data proxy

### Production Recommendations:
- ✅ `NODE_ENV="production"`
- ✅ `NEXT_PUBLIC_ENVIRONMENT="production"`

### Optional (⚠️ Features disabled without these):
- ⚠️ `FIREBASE_*` - Push notifications (optional)
- ⚠️ `INTERSWITCH_*` - Interswitch payments (optional)

---

## 🚀 DEPLOYMENT TO VERCEL

### Step 1: Prepare All Variables
Gather all critical environment variables listed above.

### Step 2: Add to Vercel
1. Go to Vercel Dashboard > Project > Settings > Environment Variables
2. Add each variable:
   ```
   NAME: DATABASE_URL
   VALUE: postgresql://...
   ENVIRONMENTS: Production, Preview, Development
   ```

### Step 3: Redeploy
```bash
git push origin main
# or trigger via Vercel Dashboard
```

---

## ✅ USER FLOW WITH REQUIRED ENV VARIABLES

### Registration Flow
Requires: `DATABASE_URL`, `JWT_SECRET`  
Uses: BVN validation via Flutterwave APIs

### Login Flow
Requires: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`  
Creates: Access token (1 hour) + Refresh token (30 days)

### Wallet Top-up
Requires: `FLW_PUBLIC_KEY`, `FLW_SECRET_KEY`, `FLW_WEBHOOK_HASH`  
Process:
1. User initiates top-up
2. Redirected to Flutterwave payment page (uses `FLW_PUBLIC_KEY`)
3. Flutterwave processes payment
4. Webhook sent to `/api/wallet/webhook` with signature verification (`FLW_WEBHOOK_HASH`)
5. Backend credits wallet using `FLW_SECRET_KEY` to verify transaction

### Buy Data
Requires: `AMIGO_API_TOKEN`, `AMIGO_PROXY_URL`  
Process:
1. User selects data plan and network
2. System deducts from wallet
3. API request to Amigo via proxy
4. Data activated on user's phone

### Buy Electricity
Requires: Database connection only  
Process:
1. User enters meter number or IUC
2. System verifies with disco
3. User pays from wallet
4. Bill sent to user's meter

### Store Purchase
Requires: `DATABASE_URL`  
Process:
1. Browse products
2. Add to cart
3. Checkout with wallet balance
4. Order created in database

---

## 🔍 TROUBLESHOOTING

### "Build error for /api/admin/stats"
**Fix:** Database must be available during build or have fallback stats

### "Payment webhook failed"
**Check:**
- [ ] `FLW_WEBHOOK_HASH` is correct
- [ ] Webhook URL configured in Flutterwave dashboard
- [ ] `FLW_SECRET_KEY` is correct in environment

### "Data purchase failed"
**Check:**
- [ ] `AMIGO_API_TOKEN` is valid and not expired
- [ ] `AMIGO_PROXY_URL` is accessible
- [ ] User has sufficient wallet balance

### "Registration failed"
**Check:**
- [ ] `DATABASE_URL` is correct and database is running
- [ ] Migrations are applied: `npx prisma migrate deploy`

---

## 📝 NOTES

- Never commit `.env.local` or actual environment variables to git
- Use `.env.example` as template for team members
- Rotate secrets regularly in production
- Use separate test/production API keys from payment providers
- Keep private keys secure and never share them
