# SaukiMart Complete Deployment & Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Database Configuration (Neon)](#database-configuration-neon)
4. [Environment Variables](#environment-variables)
5. [External Service Configuration](#external-service-configuration)
6. [Vercel Deployment](#vercel-deployment)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:
- Node.js v18+ (LTS)
- npm or yarn package manager
- Git
- GitHub account with repository access
- Vercel account (for deployment)
- PostgreSQL (or use Neon) for database
- A Neon project (PostgreSQL as a service)
- Firebase project (for admin SDK and notifications)
- Payment provider accounts (Flutterwave, Interswitch, Amigo)

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/saukiv2/Sauki02.git
cd Sauki02
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Create Local Environment File

Create a `.env.local` file in the root directory (this file is git-ignored):

```bash
cp .env.example .env.local  # if available
# Otherwise create .env.local manually and add variables (see below)
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run Migrations

```bash
npx prisma migrate dev
```

### 6. Seed Database (Optional)

```bash
npx prisma db seed
```

### 7. Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

---

## Database Configuration (Neon)

### 1. Create Neon Project

1. Visit [neon.tech](https://neon.tech)
2. Sign up or log in
3. Click "New Project"
4. Select "PostgreSQL"
5. Name your project: `saukimart-db`
6. Choose a region closest to your users (e.g., Europe/US-East)
7. Click "Create"

### 2. Get Database Connection String

1. Navigate to your Neon project dashboard
2. Under the "Connection string" section, copy the **Pooling String** (recommended for serverless)
3. Format: `postgresql://user:password@host/dbname?sslmode=require`

### 3. Create Connection String for .env.local

```env
DATABASE_URL=postgresql://[user]:[password]@[host]/[dbname]?sslmode=require
```

### 4. Verify Connection Locally

```bash
npx prisma db push
# or
npx prisma migrate dev --name init
```

If successful, Neon will be connected and your database schema will be created.

---

## Environment Variables

### Required Variables for Local Development (.env.local)

```env
# ============================================================================
# DATABASE
# ============================================================================
DATABASE_URL=postgresql://[user]:[password]@[host]/[dbname]?sslmode=require

# ============================================================================
# APPLICATION
# ============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ============================================================================
# AUTHENTICATION
# ============================================================================
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_long_for_production
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_min_32_chars_long
JWT_EXPIRY=3600                           # Access token expiry in seconds (1 hour)
JWT_REFRESH_EXPIRY=604800                 # Refresh token expiry in seconds (7 days)

# ============================================================================
# FIREBASE ADMIN SDK (for Cloud Messaging & authentication)
# ============================================================================
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key      # Replace \n with actual newlines
FIREBASE_CLIENT_EMAIL=your_client_email@project.iam.gserviceaccount.com

# ============================================================================
# PAYMENT INTEGRATIONS
# ============================================================================

# Flutterwave
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST_xxxxxxxxxxxxx
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST_xxxxxxxxxxxxx
FLUTTERWAVE_WEBHOOK_URL=https://yourdomain.com/api/wallet/webhook

# Interswitch
INTERSWITCH_CLIENT_ID=your_client_id
INTERSWITCH_CLIENT_SECRET=your_client_secret
INTERSWITCH_AUTH_STRING=your_auth_string_base64_encoded

# Amigo API (Data Vending)
AMIGO_API_TOKEN=your_api_token              # Get from Amigo dashboard
AMIGO_PROXY_URL=https://your-proxy-url/path # AWS proxy for routing requests

# ============================================================================
# NOTIFICATIONS (Firebase Cloud Messaging)
# ============================================================================
# Uses Firebase project configured above - no additional setup needed

# ============================================================================
# OPTIONAL FEATURES
# ============================================================================
ENABLE_RATE_LIMITING=true
RATE_LIMIT_WINDOW_MS=900000              # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100              # requests per window

# ============================================================================
# LOGGING
# ============================================================================
LOG_LEVEL=info                           # debug, info, warn, error
```

---

## External Service Configuration

### 1. Firebase Admin SDK Setup

#### Create Firebase Project
1. Visit [Firebase Console](https://console.firebase.google.com)
2. Click "Create a new project"
3. Name it: `SaukiMart`
4. Enable Google Analytics (optional)
5. Click "Create project"

#### Generate Admin SDK Key
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Navigate to **Service Accounts** tab
3. Click "Generate New Private Key"
4. A JSON file will download with credentials
5. Extract these values for your `.env.local`:
   - `project_id` → FIREBASE_PROJECT_ID
   - `private_key` → FIREBASE_PRIVATE_KEY
   - `client_email` → FIREBASE_CLIENT_EMAIL

**Note**: You don't need to create Firestore or additional databases. Firebase Cloud Messaging will handle notifications using just the Admin SDK credentials.

### 2. Flutterwave Setup

1. Visit [Flutterwave Dashboard](https://dashboard.flutterwave.com)
2. Sign up or log in
3. Navigate to **Merchant** > **API Keys**
4. Copy:
   - **Secret Key** (starts with `FLWSECK_`) → FLUTTERWAVE_SECRET_KEY
   - **Public Key** (starts with `FLWPUBK_`) → FLUTTERWAVE_PUBLIC_KEY

#### Configure Webhook
1. In Flutterwave Dashboard, go to **Settings** > **Webhooks**
2. Add Webhook URL: `https://yourdomain.com/api/wallet/webhook`
3. Select events: `charge.completed`
4. Save

### 3. Interswitch Setup

1. Contact Interswitch directly for account setup
2. Once onboarded, you'll receive:
   - `CLIENT_ID`
   - `CLIENT_SECRET`
   - Test/Live environment URLs

#### Create Auth String
```bash
# Base64 encode your credentials
echo -n "CLIENT_ID:CLIENT_SECRET" | base64
# Output: your_auth_string
```

### 4. Amigo API (Data Vending) Setup

#### Get API Token
1. Visit [Amigo Dashboard](https://dashboard.amigo.io)
2. Sign up or log in
3. Navigate to **API Settings** or **Developer** section
4. Copy your **API Token** → `AMIGO_API_TOKEN`

#### Configure Proxy URL
1. Your AWS proxy is already configured
2. Add the proxy URL to `.env.local`:
   ```env
   AMIGO_PROXY_URL=https://your-proxy-url/path
   ```

#### How the Integration Works
- SaukiMart sends requests to your AWS proxy
- The proxy forwards requests to Amigo API with the API token header: `X-API-Key: <YOUR_API_TOKEN>`
- Amigo processes the data vending request
- Response is returned back through the proxy to SaukiMart

**Example Request Structure**:
```json
{
  "network": 1,                    // 1=MTN, 2=Glo, 4=Airtel
  "mobile_number": "09012345678",
  "plan": 1001,                    // Plan ID from Amigo catalog
  "Ported_number": true
}
```

See [Amigo API Documentation](https://amigo.ng/docs) for full plan catalog and details.

---

## Vercel Deployment

### 1. Connect GitHub Repository

1. Visit [Vercel](https://vercel.com)
2. Sign up or log in
3. Click "New Project"
4. Select "Import Git Repository"
5. Choose your GitHub account and select `Sauki02` repository
6. Click "Import"

### 2. Configure Environment Variables

1. In Vercel project settings, go to **Settings** > **Environment Variables**
2. Add all variables from your `.env.local` (see [Environment Variables](#environment-variables) section)
3. **Important**: For production variables:
   - Use production API keys (not test keys)
   - Use production Firebase project
   - Use production Flutterwave/Interswitch credentials

### 3. Configure Build Settings

Vercel should auto-detect Next.js. Verify:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Deploy

1. Click "Deploy"
2. Vercel will build and deploy your application
3. Once complete, you'll get a production URL

### 5. Set Custom Domain

1. In Vercel project, go to **Settings** > **Domains**
2. Add your domain: `saukimart.online` (or your domain)
3. Follow DNS setup instructions
4. Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables to your domain

---

## Post-Deployment Verification

### 1. Verify Environment Setup on Vercel

1. Visit your Vercel production URL
2. Check that landing page loads
3. Test authentication flow:
   - Navigate to `/login`
   - Try login/logout
   - Verify role-based redirects (admin users → `/admin`)

### 2. Test API Endpoints

```bash
# Test contact form API
curl -X POST https://yourdomain.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "Test message"
  }'

# Expected response:
# {"success": true}
```

### 3. Verify Database Connection

```bash
# In Vercel logs, you should see successful database queries
# Navigate to admin panel to verify data loading
```

### 4. Check Webhook Configuration

1. Update Flutterwave webhook URL to production: `https://yourdomain.com/api/wallet/webhook`
2. Send test webhook to verify receipt
3. Monitor Vercel logs for webhook events

### 5. Test Payment Flow (Test Mode)

1. Use test payment credentials (Flutterwave test keys)
2. Complete a test payment
3. Verify transaction appears in admin `/admin/orders`

---

## Monitoring & Maintenance

### 1. Set Up Logging

Vercel provides real-time logs:
1. Go to **Deployments** > **Current Deployment** > **Runtime Logs**
2. Filter by messages or errors
3. Set up alerts for critical errors

### 2. Monitor Database

Neon provides monitoring dashboard:
1. Log in to [Neon Console](https://console.neon.tech)
2. View **Query Editor** for database stats
3. Monitor connections and performance
4. Set up backups (automatic daily)

### 3. Regular Maintenance Tasks

**Weekly:**
- Review failed transactions in `/admin/failed`
- Check for error logs in Vercel

**Monthly:**
- Review user sign-ups and activity
- Test payment flows
- Verify all external APIs are responding

**Quarterly:**
- Update Node.js dependencies: `npm update`
- Review and rotate API keys
- Audit security settings

### 4. Backup Strategy

```bash
# Neon provides automatic backups
# To manually backup:
pg_dump DATABASE_URL > backup_$(date +%Y%m%d).sql

# Store in secure location (AWS S3, GitHub, etc.)
```

---

## Troubleshooting

### Database Connection Issues

**Error**: `PrismaClientInitializationError`

**Solution**:
1. Verify `DATABASE_URL` is correct in Vercel environment
2. Check Neon project is active
3. Ensure IP whitelisting if applicable
4. Test connection locally: `npx prisma db push`

### Payment Integration Not Working

**Error**: `401 Unauthorized` for payment API

**Solution**:
1. Verify API keys in environment variables (not test keys in production)
2. Check webhook URL is correctly configured
3. Verify CORS settings if applicable
4. Check rate limiting on payment provider

### Firebase Errors

**Error**: `FIREBASE_PRIVATE_KEY is not valid`

**Solution**:
1. Ensure private key has `\n` replaced with actual newlines
2. Re-download the credentials JSON from Firebase Console
3. Verify all Firebase environment variables are set

### Build Failures on Vercel

**Error**: `Build failed: npm install`

**Solution**:
1. Clear Vercel cache: **Settings** > **Git** > **Clear All Caches**
2. Trigger a new deployment
3. Check `package.json` for syntax errors
4. Verify all dependencies are listed

### Environment Variables Not Applied

**Solution**:
1. Redeploy after updating environment variables
2. Verify variables appear in Vercel console
3. Check for typos in variable names (case-sensitive)

### Admin Login Not Redirecting to /admin

**Error**: Admin user redirects to `/dashboard` instead of `/admin`

**Solution**:
1. Verify user role in database (should be `ADMIN`)
2. Check JWT includes role claim
3. Test with: `SELECT role FROM "User" WHERE id = 'user_id'` in Neon

---

## Quick Reference Checklist

Before going live:

- [ ] All environment variables set in `.env.local` and Vercel
- [ ] Neon database created and migrated
- [ ] Firebase project created and SDK configured
- [ ] Flutterwave/Interswitch/Amigo credentials obtained
- [ ] Webhooks configured and tested
- [ ] Custom domain added and DNS configured
- [ ] Security: HTTPS enforced
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Admin user account created
- [ ] Contact page tested
- [ ] Payment flow tested (test mode)
- [ ] Landing pages load correctly
- [ ] Mobile responsive design verified
- [ ] Performance tested (lighthouse audit)

---

## Support Contacts

For deployment assistance:

- **Technical Support**: support@saukimart.online
- **Admin Support**: admin@saukimart.online
- **Emergency**: +2347044647081
- **Alternative**: +2349024099561

---

**Last Updated**: February 26, 2026
**Version**: 1.0
