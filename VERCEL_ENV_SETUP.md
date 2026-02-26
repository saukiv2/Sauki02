# Vercel Environment Variables Setup

## Critical Required Environment Variables

These must be set in Vercel Dashboard → Settings → Environment Variables for both **Preview** and **Production**:

### Database (REQUIRED)
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### Authentication Secrets (REQUIRED)
```
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
```

### Optional: Payment Services
```
FLW_SECRET_KEY=your-flutterwave-secret-key
FLW_PUBLIC_KEY=your-flutterwave-public-key
```

### Optional: Firebase
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

### Optional: Amigo Data (AWS Proxy)
```
AMIGO_API_KEY=your-amigo-api-key
AMIGO_BASE_URL=https://your-amigo-endpoint
```

## Setup Instructions

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: The variable name (e.g., `DATABASE_URL`)
   - **Value**: The actual value
   - **Environment**: Select **Production**, **Preview**, and **Development**
4. Click **Save**
5. Redeploy: Click **Deployments** → **Redeploy** on the latest commit

## Troubleshooting Build Errors

If you see "Failed to collect page data for /api/auth/login":

1. **Check DATABASE_URL is set** - This is the most common cause
2. **Ensure all variables have the correct environment scopes** - They need to be available during build
3. **Redeploy after adding variables** - The build must be retried after env vars are configured
