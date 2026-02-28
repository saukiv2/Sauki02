# Flutterwave Integration - Implementation Guide

## Status: BACKEND INFRASTRUCTURE COMPLETE ✅

Backend code is pushed and production-ready. This guide covers the remaining frontend and database work.

---

## Step 1: Run Database Migration in Neon

### Get Neon SQL Script
Open this file in your editor:
```
prisma/migrations/20260228_flutterwave_integration.sql
```

### Execute in Neon Console

1. Go to **Neon Dashboard** → Your Project → **SQL Editor**
2. Paste entire contents of the migration file
3. Click **Execute**
4. Verify success (should see table/column creation messages)

### Verify Migration
Run these queries in Neon to confirm:
```sql
-- Check User table has new columns
SELECT COUNT(*) as users_with_firstName FROM "User" WHERE "firstName" IS NOT NULL;

-- Check Wallet table has Flutterwave fields
SELECT COUNT(*) FROM "Wallet";

-- Check webhook log table exists
SELECT COUNT(*) FROM "FlutterwaveWebhookLog";
```

---

## Step 2: Set Environment Variables

Add to your `.env.local` (or Vercel environment):

```
# Flutterwave API Keys
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxx  # Get from Flutterwave Dashboard → Settings → API Keys
FLUTTERWAVE_WEBHOOK_HASH=xxxxxxxxxxxxxxxx          # Get from Flutterwave Dashboard → Settings → Webhooks
```

### Get These Values
1. **FLUTTERWAVE_SECRET_KEY**: 
   - Go to **Flutterwave Dashboard** → **Settings** → **API Keys**
   - Copy the **Secret Key** (test or live)

2. **FLUTTERWAVE_WEBHOOK_HASH**:
   - Go to **Flutterwave Dashboard** → **Settings** → **Webhooks**
   - Set Webhook URL: `https://YOUR_DOMAIN.com/api/webhooks/flutterwave`
   - Copy the **Webhook Hash/Secret** shown there

---

## Step 3: Update Register Page UI

File: `src/app/auth/register/page.tsx`

### Current requirement:
- firstName, lastName, phone, 6-digit PIN (not password), BVN
- Show label on BVN: "Never stored. Used only to create your virtual account."

### Key changes in form:
```tsx
// Instead of email field - remove it, no email input needed

// Instead of password field:
<input
  type="password"
  placeholder="6-digit PIN"
  value={pin}
  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
  maxLength="6"
/>

// Instead of password strength indicator:
<p className="text-xs text-gray-600">
  Set a 6-digit PIN for secure transactions
</p>

// For BVN field:
<input
  type="text"
  placeholder="11-digit BVN"
  value={bvn}
  onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
  maxLength="11"
/>
<p className="text-xs text-red-600 mt-1">
  ⚠️ Your BVN is never stored. It's only used to create your virtual account 
  with the bank.
</p>

// Form submission should send:
{
  firstName,
  lastName,
  phone,
  pin,
  bvn
}
```

### After successful registration:
Display the Flutterwave account details returned from API:
```tsx
if (user) {
  // Show success screen with:
  <div className="bg-blue-50 p-4 rounded-lg">
    <p className="font-bold">Account Created!</p>
    <p className="mt-2">Account Number: <strong>{wallet?.accountNumber}</strong></p>
    <p>Bank: <strong>{wallet?.bankName}</strong></p>
    <p className="text-xs text-gray-600 mt-2">
      Users can now transfer money to this account to fund their wallet
    </p>
  </div>
}
```

---

## Step 4: Update Login Page UI

File: `src/app/auth/login/page.tsx`

### Current requirement:
- Phone number ONLY (no email)
- 6-digit PIN ONLY (no password)

### Key changes:
```tsx
// Remove email field entirely

// Phone field - normal
<input
  type="tel"
  placeholder="08012345678"
  value={phone}
/>

// Replace password field with PIN:
<input
  type="password"
  placeholder="6-digit PIN"
  value={pin}
  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
  maxLength="6"
/>

// Help text:
<p className="text-xs text-gray-600">
  Your 6-digit PIN is used to secure transactions
</p>

// Form submission:
{
  phone,
  pin
}
```

### No other UI changes needed - auth flow is same

---

## Step 5: Update Auth Context

File: `src/contexts/auth-context.tsx`

### Update user response handling:
```tsx
// When login/register response comes back, response now includes:
{
  user: {
    id,
    firstName,
    lastName,
    phone,
    role
  },
  wallet: {
    accountNumber,
    bankName,
    balance
  }
}

// Update setUser to accept:
setUser(data.user);

// Store wallet info in session state or separate context if needed
// For now, it's displayed but not needed in context (fetched on each page load)
```

---

## Step 6: Update Wallet Card Display

File: `src/components/app/wallet-card.tsx`

### Current:
- Shows balance only

### Update to show:
```tsx
// Add account details section:
{wallet?.flwAccountNumber && (
  <div className="mt-4 p-3 bg-white/20 rounded-lg text-sm">
    <p className="opacity-75 mb-2">Your Virtual Account</p>
    <p className="font-mono font-bold">{wallet.flwAccountNumber}</p>
    <p className="text-xs opacity-75 mt-1">{wallet.flwBankName || 'WEMA Bank'}</p>
    <p className="text-xs opacity-60 mt-2">
      Transfer money here to fund your wallet
    </p>
  </div>
)}
```

### Fetch wallet details:
```tsx
// The wallet API should return the Flutterwave account details
// Update /api/wallet/balance endpoint to include:
{
  balance: number,
  balanceNaira: number,
  flwAccountNumber: string,
  flwBankName: string
}
```

---

## Step 7: Add PIN Verification Modal (For Payments)

### When user tries to purchase data or product:
1. Show PIN modal instead of just deducting
2. User enters 6-digit PIN
3. Validate against stored PIN
4. Proceed with payment

### Create file: `src/components/app/pin-modal.tsx`
```tsx
'use client';

export interface PinModalProps {
  isOpen: boolean;
  onConfirm: (pin: string) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export function PinModal({ isOpen, onConfirm, onCancel, loading }: PinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!/^\d{6}$/.test(pin)) {
      setError('PIN must be 6 digits');
      return;
    }

    try {
      await onConfirm(pin);
      setPin('');
      setError('');
    } catch (err) {
      setError('Invalid PIN');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Confirm Transaction</h2>
        <p className="text-gray-600 mb-6">Enter your 6-digit PIN to proceed</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
              {error}
            </div>
          )}
          
          <input
            type="password"
            placeholder="000000"
            maxLength="6"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="w-full border rounded-lg p-3 text-center tracking-widest"
            disabled={loading}
          />
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 border border-gray-300 rounded-lg p-2 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || pin.length !== 6}
              className="flex-1 bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### Usage in data purchase:
```tsx
const [showPinModal, setShowPinModal] = useState(false);

const handlePurchase = async () => {
  setShowPinModal(true);
};

const handlePinConfirm = async (pin: string) => {
  // Send PIN with purchase request
  await purchaseData({
    planId,
    pin,  // Include PIN in request
  });
  setShowPinModal(false);
};

// In handle, show modal:
<PinModal
  isOpen={showPinModal}
  onConfirm={handlePinConfirm}
  onCancel={() => setShowPinModal(false)}
  loading={processing}
/>
```

---

## Step 8: Update Data & Electricity Purchase APIs

Files:
- `src/app/api/data/purchase/route.ts`
- `src/app/api/electricity/pay/route.ts`

### Add PIN validation:
```ts
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const body = await request.json();
  const { planId, pin, phoneNumber } = body;

  // Get user with PIN
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pin: true, wallet: true }
  });

  // Verify PIN
  if (pin !== user.pin) {
    return NextResponse.json(
      { message: 'Invalid PIN' },
      { status: 401 }
    );
  }

  // Proceed with purchase...
}
```

---

## Step 9: Test End-to-End Flow

### Test Registration:
1. Go to register page
2. Enter: firstName, lastName, phone, 6-digit PIN, 11-digit BVN
3. Check for success message with account number
4. Verify in database: `SELECT * FROM "Wallet" WHERE flwAccountNumber IS NOT NULL;`

### Test Login:
1. Go to login page
2. Enter phone + PIN (no email!)
3. Should log in successfully
4. Dashboard should show account number in wallet card

### Test Webhook (Simulated):
```bash
curl -X POST https://YOUR_DOMAIN/api/webhooks/flutterwave \
  -H "verif-hash: $FLUTTERWAVE_WEBHOOK_HASH" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "charge.completed",
    "data": {
      "tx_ref": "VA-USER_ID-TIMESTAMP",
      "flw_ref": "FLW-xxx",
      "amount": 1000,
      "status": "successful",
      "customer": {
        "phone_number": "08012345678"
      }
    }
  }'
```

### Verify wallet balance increased
```sql
SELECT balance_kobo, flw_account_number FROM "Wallet" WHERE user_id = 'TEST_USER_ID';
```

---

## Flutterwave API Reference (For Payment Integration)

### Key Endpoints Used:
1. **Create Virtual Account** (Done in register) - `/v3/virtual-account-numbers` POST
2. **Fetch Account** - `/v3/virtual-account-numbers/{order_ref}` GET
3. **Webhook** - Your app listens at `/api/webhooks/flutterwave`

### Webhook Mapping:
- **tx_ref** = User's unique tx_ref → Map to wallet via `flwTxRef`
- **amount** = Deposit amount in NGN
- **status** = "successful" means money arrived
- **customer phone** = Customer metadata (optional verification)

### Example Webhook Payload:
```json
{
  "event": "charge.completed",
  "data": {
    "tx_ref": "VA-userid-timestamp",
    "flw_ref": "FLW-211b4eea7b3d...",
    "amount": 500.00,
    "status": "successful",
    "currency": "NGN",
    "charge_amount": 501.40,
    "app_fee": 1.40,
    "customer": {
      "id": 980070204,
      "name": "John Doe",
      "phone_number": "08100000000",
      "email": "john@example.com"
    }
  }
}
```

---

## Troubleshooting

### Issue: "BVN is required for static account"
- BVN must be exactly 11 digits
- Remove any spaces/formatting

### Issue: "tx_ref already exists"
- This means user tried to register twice
- The Flutterwave account creation is idempotent on tx_ref
- If user gets this error, they should try login instead

### Issue: Webhook not firing
1. Verify webhook URL is publicly accessible
2. Check `FLUTTERWAVE_WEBHOOK_HASH` is correct
3. Test manually with curl command above
4. Check Vercel logs for errors

### Issue: PIN not validating on purchase
- Verify PIN is being sent as 6-digit string
- Check PIN comparison logic in purchase endpoint
- Add logging: `console.log('[Purchase] PIN match:', pin === userPin);`

---

## Deployment Checklist

- [ ] Database migration run in Neon
- [ ] Environment variables set (FLUTTERWAVE_SECRET_KEY, WEBHOOK_HASH)
- [ ] Register page UI updated
- [ ] Login page UI updated
- [ ] Wallet card updated to show account details
- [ ] PIN modal component created
- [ ] Data purchase API updated with PIN validation
- [ ] Electricity API updated with PIN validation
- [ ] Webhook URL configured in Flutterwave dashboard
- [ ] End-to-end testing complete
- [ ] Deploy to production

---

## Notes

- **BVN is NOT stored** in database (removed after account creation)
- **PIN is hashed and stored** for security
- **Email is generic** for all users (accounts@saukimart.online)
- **Flutterwave account is permanent** (is_permanent: true)
- **Bank is automatically assigned** (usually WEMA Bank)
- **Webhook verification** uses FLUTTERWAVE_WEBHOOK_HASH from Flutterwave dashboard

---

## Questions?

Check logs:
```bash
# Vercel logs
vercel logs --tail

# Search for Flutterwave errors
vercel logs "[Flutterwave]" --tail
```

All API endpoints log with `[Register]`, `[Login]`, `[Webhook]`, `[Flutterwave]` prefixes for debugging.
