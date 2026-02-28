import axios from 'axios';

const FLW_API_BASE = 'https://api.flutterwave.com/v3';
const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || '';

if (!FLW_SECRET_KEY) {
  console.warn('[Flutterwave] Warning: FLUTTERWAVE_SECRET_KEY not set');
}

interface CreateVirtualAccountRequest {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  bvn: string;
  userId: string; // For generating unique tx_ref
}

interface CreateVirtualAccountResponse {
  accountNumber: string;
  bankName: string;
  orderRef: string;
  flwRef: string;
  txRef: string;
}

/**
 * Create a static virtual account for a user using Flutterwave API
 * @param data Customer data to create account
 * @returns Account details or null if creation fails
 */
export async function createStaticVirtualAccount(
  data: CreateVirtualAccountRequest
): Promise<CreateVirtualAccountResponse | null> {
  try {
    console.log('[Flutterwave] Creating static virtual account for phone:', data.phone);

    // Generate unique tx_ref - must be unique per customer
    // Format: VA-{userId}-{timestamp}
    const txRef = `VA-${data.userId}-${Date.now()}`;

    const payload = {
      email: data.email,
      tx_ref: txRef,
      phonenumber: data.phone,
      is_permanent: true, // This makes it STATIC (permanent)
      firstname: `SAUKI ${data.firstName}`,
      lastname: data.lastName,
      narration: `Wallet - SAUKI ${data.firstName} ${data.lastName}`,
      bvn: data.bvn,
    };

    console.log('[Flutterwave] Payload:', { ...payload, bvn: '***' });

    const response = await axios.post(
      `${FLW_API_BASE}/virtual-account-numbers`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[Flutterwave] Response status:', response.status);

    const { status, data: responseData } = response.data;

    if (status !== 'success') {
      console.error('[Flutterwave] Creation failed:', response.data);
      return null;
    }

    const {
      account_number: accountNumber,
      bank_name: bankName,
      order_ref: orderRef,
      flw_ref: flwRef,
    } = responseData;

    console.log('[Flutterwave] ✓ Account created:', {
      accountNumber,
      bankName,
      orderRef,
    });

    return {
      accountNumber,
      bankName,
      orderRef,
      flwRef,
      txRef,
    };
  } catch (error: any) {
    console.error('[Flutterwave] Error creating account:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return null;
  }
}

/**
 * Fetch a virtual account using order_ref
 */
export async function getVirtualAccount(orderRef: string) {
  try {
    console.log('[Flutterwave] Fetching account:', orderRef);

    const response = await axios.get(
      `${FLW_API_BASE}/virtual-account-numbers/${orderRef}`,
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
        },
      }
    );

    const { status, data: responseData } = response.data;

    if (status !== 'success') {
      console.error('[Flutterwave] Fetch failed:', response.data);
      return null;
    }

    return responseData;
  } catch (error: any) {
    console.error('[Flutterwave] Error fetching account:', error.message);
    return null;
  }
}

/**
 * Verify webhook signature from Flutterwave
 * @param signature The verif-hash header from webhook
 * @returns true if signature is valid
 */
export function verifyWebhookSignature(signature: string): boolean {
  const webhookHash = process.env.FLUTTERWAVE_WEBHOOK_HASH || '';

  if (!webhookHash) {
    console.warn('[Flutterwave] Warning: FLUTTERWAVE_WEBHOOK_HASH not set');
    return false;
  }

  const isValid = signature === webhookHash;
  console.log('[Flutterwave] Webhook signature valid:', isValid);

  return isValid;
}

/**
 * Parse webhook payload and extract relevant data
 */
export function parseWebhookPayload(payload: any) {
  try {
    const { event, data } = payload;

    if (!data) {
      console.error('[Flutterwave] Invalid webhook payload - no data field');
      return null;
    }

    const {
      tx_ref: txRef,
      flw_ref: flwRef,
      amount,
      status,
      customer,
      charge_amount: chargedAmount,
    } = data;

    console.log('[Flutterwave] Parsed webhook:', {
      event,
      txRef,
      flwRef,
      amount,
      status,
      customerPhone: customer?.phone_number,
    });

    return {
      event,
      txRef,
      flwRef,
      amount,
      status,
      chargedAmount,
      customer,
    };
  } catch (error: any) {
    console.error('[Flutterwave] Error parsing webhook:', error.message);
    return null;
  }
}

