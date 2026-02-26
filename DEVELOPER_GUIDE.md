# SaukiMart Developer Quick Reference

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev

# Type checking
npm run type-check

# Production build
npm run build
npm start
```

---

## 📂 File Organization

### Core Application Pages
- **Dashboard**: `/src/app/(app)/dashboard/page.tsx` - Welcome + quick access
- **Data Vending**: `/src/app/(app)/data/page.tsx` - Mobile data purchasing
- **Electricity**: `/src/app/(app)/electricity/page.tsx` - Bill payment
- **Store**: `/src/app/(app)/store/page.tsx` - Product browsing
- **Wallet**: `/src/app/(app)/wallet/page.tsx` - Balance + transaction history
- **Profile**: `/src/app/(app)/profile/page.tsx` - User account settings

### Main Components
Located in `/src/components/app/`:
- `app-layout.tsx` - Sidebar + top navigation wrapper
- `data-vending.tsx` - Network tabs + plan selection
- `electricity-payment.tsx` - Meter validation + payment form
- `gadgets-store.tsx` - Product grid with pagination
- `notification-bell.tsx` - Web notifications (60s polling)
- `wallet-card.tsx` - Wallet balance display

### Backend APIs
Located in `/src/app/api/`:
```
├── auth/                   # Authentication (JWT, register, login, refresh)
├── data/                   # Mobile data (plans, purchase, history, seed)
├── electricity/            # Electricity (discos, validate, pay)
├── products/               # E-commerce (CRUD, image upload)
├── notifications/          # Web notifications (fetch, mark read)
├── wallet/                 # Wallet (balance, transactions, webhook)
└── cart/                   # Shopping cart (TODO)
```

### Utilities
- `/src/lib/amigo.ts` - Amigo mobile data API client
- `/src/lib/interswitch.ts` - Interswitch electricity + OAuth2
- `/src/lib/firebase-admin.ts` - Firebase Admin SDK setup
- `/src/lib/flutterwave.ts` - Flutterwave integration
- `/src/lib/notify.ts` - Notification service
- `/src/lib/auth.ts` - JWT utilities
- `/src/lib/validation.ts` - Zod schemas

### Hooks
- `useApi()` - API requests (get, post, patch, put, delete)
- `useAuth()` - Auth state (user, login, logout)
- `useWallet()` - Wallet state
- `useCart()` - Shopping cart state
- `useModal()` - Modal dialogs
- `useToast()` - Toast notifications

---

## 💻 Common Development Tasks

### Adding a New API Endpoint

```typescript
// /src/app/api/[feature]/[action]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  // Define request schema
});

export async function POST(req: NextRequest) {
  try {
    // Verify auth if needed
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Parse and validate request
    const body = await req.json();
    const data = schema.parse(body);

    // Process request
    const result = await db.model.create({ data });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

### Creating a New Component

```typescript
// /src/components/app/my-component.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/use-api';

export const MyComponent = () => {
  const { get, post, loading, error } = useApi();
  const [data, setData] = useState(null);

  const handleClick = async () => {
    const response = await post('/api/some-endpoint', { /* data */ });
    if ((response as any)?.success) {
      setData((response as any)?.data);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold">My Component</h2>
      <Button onClick={handleClick} disabled={loading}>
        Click Me
      </Button>
    </Card>
  );
};
```

### Adding a New Page

```typescript
// /src/app/(app)/my-feature/page.tsx
'use client';

export default function MyFeaturePage() {
  return (
    <div className="space-y-6">
      {/* Page content */}
    </div>
  );
}
```

---

## 🔐 Authentication Flow

### Protected Routes
1. Middleware checks JWT token in headers
2. Verifies token expiry and signature
3. Attaches user info to request
4. Routes without token → redirect to login

### API Authentication
```typescript
// All protected endpoints check:
const user = await verifyAuth(req);
if (!user) return unauthorized();
```

### User Roles
- `user` - Normal customer
- `admin` - Admin access (product management, user management)

---

## 💰 Wallet Transaction Types

| Type | Debit | Credit | Example |
|------|-------|--------|---------|
| Data Purchase | ✓ | | User buys 1GB data |
| Electricity Payment | ✓ | | User pays bill |
| Deposit | | ✓ | Virtual account transfer |
| Refund | | ✓ | Failed transaction auto-refund |
| Withdrawal | ✓ | | User withdraws to bank |
| Agent Commission | | ✓ | Agent receives commission |

---

## 🐛 Debugging

### TypeScript Errors
```bash
npm run type-check
```

### Build Issues
```bash
npm run build
# Check output for errors

# Clean build
rm -rf .next
npm run build
```

### Database Issues
```bash
# Reset database
npx prisma migrate reset

# View Prisma Studio
npx prisma studio

# Create migration
npx prisma migrate dev --name migration_name
```

### Check Logs
- **Server**: Terminal running `npm run dev`
- **Database**: Check PostgreSQL logs
- **Firebase**: Firebase Console
- **Flutterwave**: Flutterwave Dashboard
- **Interswitch**: Interswitch Portal

---

## 📊 Database Schemas Reference

### User
```typescript
{
  id: string
  email: string
  phoneNumber: string
  firstName: string
  lastName: string
  passwordHash: string
  role: 'user' | 'admin'
  status: 'active' | 'inactive' | 'suspended'
  bvnVerified: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Wallet
```typescript
{
  id: string
  userId: string
  balance: number (in kobo)
  virtualAccountNumber?: string
  bankName?: string
  createdAt: Date
  updatedAt: Date
}
```

### Transaction
```typescript
{
  id: string
  userId: string
  type: 'credit' | 'debit'
  amount: number (in kobo)
  reference: string
  description?: string
  metadata?: JSON
  status: 'pending' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
}
```

---

## 🎨 UI Component Props

### Button
```typescript
<Button
  onClick={() => {}}
  disabled={false}
  variant="primary" | "outline" | "ghost"
  className="w-full bg-indigo-600"
>
  Click Me
</Button>
```

### Card
```typescript
<Card className="p-6 shadow">
  {/* Content */}
</Card>
```

### Modal
```typescript
<Modal isOpen={true} onClose={() => {}} title="Modal Title">
  {/* Content */}
</Modal>
```

### Input
```typescript
<Input
  type="text"
  placeholder="Enter value"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  disabled={false}
/>
```

---

## 🔗 API Response Format

All API responses follow this format:
```typescript
{
  success: boolean
  data?: any
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
    unread?: number
  }
}
```

### Error Responses
```typescript
// 400 - Bad Request
{ success: false, error: 'Validation failed' }

// 401 - Unauthorized
{ success: false, error: 'Authentication required' }

// 403 - Forbidden
{ success: false, error: 'Insufficient permissions' }

// 404 - Not Found
{ success: false, error: 'Resource not found' }

// 500 - Server Error
{ success: false, error: 'Internal Server Error' }
```

---

## 📱 Frontend Hooks Usage

### useApi
```typescript
const { get, post, patch, put, delete: del, loading, error } = useApi();

const data = await get('/api/endpoint');
const result = await post('/api/endpoint', { key: 'value' });
const updated = await patch('/api/endpoint/id', { key: 'newValue' });
const deleted = await del('/api/endpoint/id');
```

### useAuth
```typescript
const user = useUser();
const { logout } = useAuthMethods();

if (user?.role === 'admin') { /* admin only */ }
await logout();
```

---

## 🚨 Error Handling Best Practices

```typescript
// Always type cast API responses
const response = await get('/api/endpoint');
if ((response as any)?.success) {
  const data = (response as any)?.data;
  // Use data
}

// Check for error state
const { get, error } = useApi();
if (error) {
  console.error('API Error:', error);
  // Show user-friendly error
}

// Try-catch for async operations
try {
  const result = await someAsyncOperation();
} catch (err) {
  console.error('Error:', err);
  // Handle error
}
```

---

## 🎯 Performance Tips

1. **Image Optimization**: Use Sharp for WebP conversion
2. **Token Caching**: Cache Interswitch tokens (5-min refresh)
3. **Database Indexing**: Index frequently-queried fields
4. **Query Optimization**: Use pagination, limit fields
5. **Component Lazy Loading**: Defer non-critical components
6. **Notification Polling**: 60-second interval (don't go lower)

---

## 📝 Commit Message Format

```
type(scope): subject

body

footer
```

Examples:
- `feat(auth): add BVN verification`
- `fix(wallet): prevent double deduction`
- `refactor(api): optimize database queries`
- `docs(readme): update setup instructions`

---

## 🔄 Common Workflows

### To Deploy Changes
```bash
npm run type-check    # Verify types
npm run build         # Build for production
# Test build locally
npm start
# Deploy
git push origin main
```

### To Add New Feature
1. Create API endpoint in `/src/app/api/`
2. Create component in `/src/components/app/`
3. Create page in `/src/app/(app)/`
4. Update navigation in `app-layout.tsx`
5. Run type check and build

### To Debug Production Issues
1. Check error logs
2. Review recent git commits
3. Test endpoint directly (curl/Postman)
4. Check database state
5. Review relevant environmental variables

---

## 📞 Support

- **TypeScript Errors**: Run `npm run type-check`
- **Build Failed**: Run `npm run build` to see full error
- **Database Issues**: Check migrations with `npx prisma migrate status`
- **API Issues**: Check endpoint implementation and middleware

---

**Last Updated**: Phase 9 completion
**Framework**: Next.js 14, React 18, TypeScript
**Styling**: Tailwind CSS 3.x
