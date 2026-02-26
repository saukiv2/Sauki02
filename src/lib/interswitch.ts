/**
 * Interswitch Electricity Billing Integration
 * Handles DisCo meter validation and bill payment advice
 * OAuth2 based authentication with token caching
 */

export interface ISWToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  issued_at: number; // timestamp when token was obtained
}

// All 13 Nigerian Distribution Companies (DisCos)
export const DISCO_BILLERS = {
  ABUJA: { name: 'Abuja Electricity Distribution Plc', code: 'AEDC', billerId: 501 },
  BENIN: { name: 'Benin Electricity Distribution Plc', code: 'BEDC', billerId: 502 },
  CALABAR: { name: 'Cross River Electricity Distribution Plc', code: 'CCDC', billerId: 503 },
  ENUGU: { name: 'EEDC', code: 'EEDC', billerId: 504 },
  IBADAN: { name: 'Ibadan Electricity Distribution Company', code: 'IBEDC', billerId: 505 },
  IKEJA: { name: 'Ikeja Electric Plc', code: 'IKEDC', billerId: 506 },
  JOS: { name: 'JED', code: 'JEDC', billerId: 507 },
  KANO: { name: 'Kano Electric Distribution Company', code: 'KEDC', billerId: 508 },
  KATSINA: { name: 'Katsina Electricity Distribution Plc', code: 'KAEDC', billerId: 509 },
  MAIDUGURI: { name: 'Maiduguri Electricity Distribution Company', code: 'MEDC', billerId: 510 },
  OKO: { name: 'Eko Electricity Distribution Company Plc', code: 'EKEDC', billerId: 511 },
  PORTHARCOURT: { name: 'Port Harcourt Electricity Distribution Company', code: 'PHEDC', billerId: 512 },
  YOLA: { name: 'Yola Electricity Distribution Company', code: 'YEDC', billerId: 513 },
} as const;

export type DISCOCode = keyof typeof DISCO_BILLERS;

let cachedToken: ISWToken | null = null;

/**
 * Get OAuth2 access token from Interswitch
 * Tokens are cached and reused until expiry
 */
async function getISWToken(): Promise<string> {
  // Check if cached token is still valid
  if (cachedToken) {
    const now = Date.now();
    const tokenAge = now - cachedToken.issued_at;
    const tokenValidMs = (cachedToken.expires_in - 300) * 1000; // Refresh 5 minutes before expiry

    if (tokenAge < tokenValidMs) {
      return cachedToken.access_token;
    }
  }

  const clientId = process.env.ISW_CLIENT_ID || '';
  const clientSecret = process.env.ISW_CLIENT_SECRET || '';

  if (!clientId || !clientSecret) {
    throw new Error('Interswitch credentials not configured');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://qa.interswitchng.com/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=*',
  });

  if (!response.ok) {
    throw new Error(`Failed to get Interswitch token: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = {
    access_token: data.access_token,
    token_type: data.token_type,
    expires_in: data.expires_in,
    issued_at: Date.now(),
  };

  return cachedToken.access_token;
}

/**
 * Validate customer meter number with DisCo
 * Returns customer name and account details
 */
export async function validateCustomer(
  meterNo: string,
  disco: DISCOCode
): Promise<{
  status: string;
  customerName: string;
  outstandingBalance: number;
  minimumAmount: number;
  customerCode: string;
}> {
  const token = await getISWToken();
  const billerId = DISCO_BILLERS[disco].billerId;

  const response = await fetch(
    `https://qa.interswitchng.com/quickteller/api/billers/${billerId}/customers/${encodeURIComponent(meterNo)}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Meter number not found for this DisCo');
    }
    throw new Error(`Customer validation failed: ${response.status}`);
  }

  const data = await response.json();

  return {
    status: 'VALID',
    customerName: data.name || data.customerName || 'Customer',
    outstandingBalance: data.outstandingBalance || 0,
    minimumAmount: data.minimumAmount || 5000, // Default 50 naira minimum
    customerCode: data.code || meterNo,
  };
}

/**
 * Send bill payment advice to Interswitch
 * Confirms payment after wallet is charged
 */
export async function sendBillPaymentAdvice(
  meterNo: string,
  disco: DISCOCode,
  amountNaira: number,
  transactionRef: string,
  customerCode: string
): Promise<{
  token: string;
  reference: string;
  status: string;
  message: string;
}> {
  const token = await getISWToken();
  const billerId = DISCO_BILLERS[disco].billerId;

  const payload = {
    amount: Math.round(amountNaira * 100), // Convert naira to kobo
    transactionReference: transactionRef,
    customerMeterNumber: meterNo,
    customerCode,
    serviceTypeId: 1, // Standard service type
  };

  const response = await fetch(
    `https://qa.interswitchng.com/quickteller/api/billers/${billerId}/customers/${encodeURIComponent(meterNo)}/payments`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Bill payment advice failed: ${response.status} - ${errorData}`);
  }

  const data = await response.json();

  return {
    token: data.token || '', // Prepaid: electricity token, Postpaid: empty
    reference: data.reference || transactionRef,
    status: data.status || 'SUCCESS',
    message: data.message || 'Payment processed successfully',
  };
}

/**
 * Get all available DiscosBiller info
 */
export function getAllDiscos(): Array<{
  code: DISCOCode;
  name: string;
  billerId: number;
}> {
  return Object.entries(DISCO_BILLERS).map(([code, info]) => ({
    code: code as DISCOCode,
    name: info.name,
    billerId: info.billerId,
  }));
}

/**
 * Parse DisCo code from various formats
 * Supports: ABUJA, Ikeja, IKEDC, etc.
 */
export function parseDisco(input: string): DISCOCode {
  const normalized = input.toUpperCase().replace(/[- ]/g, '');

  // Direct code match
  for (const [code, info] of Object.entries(DISCO_BILLERS)) {
    if (normalized === code.toUpperCase() || normalized === info.code.toUpperCase()) {
      return code as DISCOCode;
    }
  }

  // Partial name match
  for (const [code, info] of Object.entries(DISCO_BILLERS)) {
    if (info.name.includes(input.toUpperCase())) {
      return code as DISCOCode;
    }
  }

  throw new Error(`Unknown DisCo: ${input}`);
}
