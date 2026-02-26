/**
 * Amigo API Integration for mobile data top-ups
 * Routes requests through AWS proxy for rate limiting
 */

export interface AmigoRequest {
  network: 1 | 2 | 4; // 1=MTN, 2=Glo, 4=Airtel
  mobile_number: string;
  plan: string | number;
  Ported_number: boolean;
}

export interface AmigoResponse {
  success: boolean;
  reference: string;
  message: string;
  amount_charged: number;
  status: 'delivered' | 'failed' | 'pending';
}

export interface ProxyRequest {
  provider: 'AMIGO' | 'CUSTOM';
  targetUrl: string;
  requestBody: AmigoRequest;
  idempotencyKey?: string;
}

export interface ProxyResponse {
  success: boolean;
  data: AmigoResponse;
}

const NETWORK_MAP: Record<string, 1 | 2 | 4> = {
  'MTN': 1,
  'GLO': 2,
  'AIRTEL': 4,
};

const AWS_PROXY_URL = process.env.AMIGO_PROXY_URL || 'https://proxy.example.com/api/data';
const AMIGO_TOKEN = process.env.AMIGO_API_TOKEN || '';

/**
 * Get network ID from network name
 */
export function getNetworkId(network: string): 1 | 2 | 4 {
  const id = NETWORK_MAP[network.toUpperCase()];
  if (!id) throw new Error(`Unknown network: ${network}`);
  return id;
}

/**
 * Purchase data via Amigo API through AWS proxy
 */
export async function purchaseDataViaAmigo(
  phoneNumber: string,
  network: string,
  planId: string | number,
  idempotencyKey: string
): Promise<AmigoResponse> {
  const networkId = getNetworkId(network);

  const amigoRequest: AmigoRequest = {
    network: networkId,
    mobile_number: phoneNumber,
    plan: planId,
    Ported_number: true,
  };

  const proxyRequest: ProxyRequest = {
    provider: 'AMIGO',
    targetUrl: 'https://amigo.ng/api/data/',
    requestBody: amigoRequest,
    idempotencyKey,
  };

  try {
    const response = await fetch(AWS_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': AMIGO_TOKEN,
      },
      body: JSON.stringify(proxyRequest),
    });

    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status}`);
    }

    const data: ProxyResponse = await response.json();

    if (!data.success) {
      throw new Error(data.data?.message || 'Data purchase failed');
    }

    return data.data;
  } catch (error) {
    console.error('Amigo API error:', error);
    throw error;
  }
}

/**
 * Validate phone number
 * Nigerian numbers: 070, 080, 081, 090, 091 followed by 8 digits
 * Total: 11 digits, all numeric
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^(070|080|081|090|091)\d{8}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

/**
 * Format phone number to standard Nigerian format
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return '0' + cleaned;
  }
  return cleaned;
}
