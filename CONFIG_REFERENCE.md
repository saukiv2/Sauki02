# SaukiMart Configuration Reference (Updated)

## Corrected Environment Variables

This document clarifies the exact environment variables needed for SaukiMart deployment.

---

## Firebase Configuration

### What You Need
- **FIREBASE_PROJECT_ID**: From Firebase Console > Project Settings
- **FIREBASE_PRIVATE_KEY**: From Service Account JSON (private_key field)
- **FIREBASE_CLIENT_EMAIL**: From Service Account JSON (client_email field)

### What You Don't Need
- ❌ FIREBASE_DATABASE_URL
- ❌ FIREBASE_STORAGE_BUCKET
- ❌ FIREBASE_MESSAGING_SENDER_ID
- ❌ Firestore Database (not required)

### Purpose
These credentials are used exclusively for Firebase Cloud Messaging (FCM). The Admin SDK uses these to send push notifications to users.

---

## Amigo API Configuration

### The New Way
```env
AMIGO_API_TOKEN=YOUR_TOKEN_FROM_AMIGO_DASHBOARD
AMIGO_PROXY_URL=https://your-aws-proxy-endpoint/api/data
```

### What Changed
- **Old**: AMIGO_USERNAME, AMIGO_PASSWORD, AMIGO_PUBLIC_KEY
- **New**: AMIGO_API_TOKEN only
- **Proxy**: Use AMIGO_PROXY_URL (not AWS_PROXY_URL)

### How It Works
1. SaukiMart sends request to AMIGO_PROXY_URL with:
   - Body: `{ network, mobile_number, plan, Ported_number }`
   - Header: `X-API-Key: {AMIGO_API_TOKEN}`

2. Your AWS proxy forwards to:
   - URL: `https://amigo.ng/api/data/`
   - With the same headers and body

3. Amigo responds with transaction result
4. Proxy returns response to SaukiMart

### Amigo Plans Reference
See [Amigo Data Catalog](/AMIGO_DATA_API.md) or the official docs for complete plan IDs.

**Quick Networks:**
- MTN (id: 1) - Plans: 5000, 1001, 6666, 3333, 9999, 7777, 1110, 1515, 424, 379, 360
- Glo (id: 2) - Plans: 218, 217, 206, 195, 196, 222, 512
- Airtel (id: 4) - Plans: 539, 400, 401, 532, 391, 392, 405, 404

---

## Notifications

### Firebase Cloud Messaging (FCM)
- **Provider**: Firebase (not replaced)
- **Setup**: Automatic with FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL
- **What Removed**: Pushwoosh (no longer used)

### What You Don't Need
- ❌ PUSHWOOSH_APP_CODE
- ❌ PUSHWOOSH_API_KEY

---

## Email Services

### Current Status
- **SendGrid**: Not configured
- **Mailgun**: Not configured
- **Custom**: Not implemented

### What You Don't Need
- ❌ SENDGRID_API_KEY
- ❌ MAILGUN_API_KEY
- ❌ MAILGUN_DOMAIN

**Note**: If you need email notifications in the future, we can add SendGrid or similar.

---

## Complete .env.local Template

```env
# ============================================================================
# DATABASE
# ============================================================================
DATABASE_URL=postgresql://user:password@host:port/saukimart

# ============================================================================
# APPLICATION
# ============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================================================
# AUTHENTICATION
# ============================================================================
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_long
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars_long
JWT_EXPIRY=3600
JWT_REFRESH_EXPIRY=604800

# ============================================================================
# FIREBASE (Cloud Messaging)
# ============================================================================
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
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
INTERSWITCH_AUTH_STRING=base64_encoded_id_secret

# Amigo API (Data Vending)
AMIGO_API_TOKEN=your_api_token
AMIGO_PROXY_URL=https://your-aws-proxy-endpoint/path

# ============================================================================
# OPTIONAL FEATURES
# ============================================================================
ENABLE_RATE_LIMITING=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

---

## Setup Checklist

### Local Development
- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in DATABASE_URL (Neon PostgreSQL)
- [ ] Add FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL
- [ ] Add AMIGO_API_TOKEN and AMIGO_PROXY_URL
- [ ] Add payment provider credentials (Flutterwave/Interswitch)
- [ ] Run `npx prisma migrate dev`
- [ ] Run `npm run dev`

### Vercel Deployment
- [ ] In Vercel Settings > Environment Variables
- [ ] Add all variables from `.env.local`
- [ ] For NEXT_PUBLIC_APP_URL: use your production domain
- [ ] For payment keys: use production keys (not test)
- [ ] For Firebase: use production project credentials
- [ ] Deploy and verify all endpoints work

---

## Verification Commands

### Test Amigo Integration
```bash
# Check if AMIGO_API_TOKEN is set
echo $AMIGO_API_TOKEN

# Check if AMIGO_PROXY_URL is valid
curl -I $AMIGO_PROXY_URL
```

### Test Firebase
```bash
# The app will automatically initialize Firebase with the credentials
# Check Vercel logs for any Firebase errors during startup
```

### Test Database
```bash
# Connect to Neon
psql $DATABASE_URL

# Check ContactMessage table
SELECT * FROM "ContactMessage" LIMIT 5;
```

---

## Common Issues & Solutions

### Issue: "X-API-Key header required" from Amigo
**Solution**: 
- Verify AMIGO_API_TOKEN is set in `.env.local`
- Verify AWS proxy is correctly forwarding the header
- Check Vercel logs for actual token value

### Issue: Firebase initialization fails
**Solution**:
- Verify FIREBASE_PRIVATE_KEY has actual newlines (not escaped `\n`)
- Verify all three Firebase variables are set
- Re-download credentials JSON from Firebase Console

### Issue: Data purchase returns 404
**Solution**:
- Verify AMIGO_PROXY_URL is correct
- Check network ID is correct (1=MTN, 2=Glo, 4=Airtel)
- Check plan ID exists for that network
- Use test number starting with 090000 for sandbox

### Issue: Environment variables not applied
**Solution**:
- Redeploy Vercel after adding variables
- Clear Vercel cache: Settings > Git > Clear All Caches
- Verify variables appear in Vercel console
- Check for typos (case-sensitive)

---

**Last Updated**: February 26, 2026
